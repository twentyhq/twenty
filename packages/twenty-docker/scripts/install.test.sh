#!/bin/bash
# Exercises install.sh and 1-click.sh against the real Docker Hub and GitHub.
# Usage: install.test.sh <git ref>
# <git ref> is where the scripts under test fetch docker-compose.yml, .env.example and
# install.sh from: the pull request head sha in CI, any pushed branch or sha locally.
set -euo pipefail

scripts_dir=$(cd "$(dirname "$0")" && pwd)
ref=${1:?usage: $0 <git ref>}
release_tag_pattern='^v[0-9]+\.[0-9]+\.[0-9]+$'

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT
cd "$work_dir"

function pass {
  echo "✅ $1"
}

function fail {
  echo "❌ $1"
  exit 1
}

# Answers the directory prompt, declines to start the containers, and captures output and exit status
function run_install {
  local directory=$1
  shift
  install_output=$(printf '%s\nn\n' "$directory" | env "$@" "$scripts_dir/install.sh" 2>&1) && install_status=0 || install_status=$?
}

function run_one_click {
  local directory=$1
  shift
  install_output=$(printf '%s\nn\n' "$directory" | env "$@" bash "$scripts_dir/1-click.sh" 2>&1) && install_status=0 || install_status=$?
}

function assert_install_directory {
  local directory=$1
  local expected_tag=$2
  [ -f "$directory/docker-compose.yml" ] || fail "$directory/docker-compose.yml is missing"
  [ -f "$directory/.env" ] || fail "$directory/.env is missing"
  ! ls "$directory"/*.tmp >/dev/null 2>&1 || fail "$directory still contains a .tmp download"
  grep -q "^TAG=$expected_tag$" "$directory/.env" || fail "$directory/.env does not pin TAG=$expected_tag"
  grep -q "^ENCRYPTION_KEY=." "$directory/.env" || fail "$directory/.env has no generated ENCRYPTION_KEY"
  grep -q "^PG_DATABASE_PASSWORD=." "$directory/.env" || fail "$directory/.env has no generated PG_DATABASE_PASSWORD"
  (cd "$directory" && docker compose config --quiet 2>/dev/null) || fail "docker compose config rejects $directory"
}

echo "▶ default resolution pairs the newest Docker Hub release with its twenty/<version> git tag"
run_install default
[ "$install_status" -eq 0 ] || fail "install.sh failed without arguments: $install_output"
resolved_version=$(echo "$install_output" | sed -n 's/.*Using docker version \([^ ]*\) and Github branch \([^ ]*\).*/\1/p')
resolved_branch=$(echo "$install_output" | sed -n 's/.*Using docker version \([^ ]*\) and Github branch \([^ ]*\).*/\2/p')
[[ "$resolved_version" =~ $release_tag_pattern ]] || fail "resolved version '$resolved_version' is not a release tag"
[ "$resolved_branch" = "twenty/$resolved_version" ] || fail "resolved branch '$resolved_branch' does not match twenty/$resolved_version"
assert_install_directory default "$resolved_version"
pass "resolved $resolved_version from $resolved_branch"

echo "▶ files fetched from $ref produce a valid setup"
run_install from-ref BRANCH="$ref"
[ "$install_status" -eq 0 ] || fail "install.sh failed with BRANCH=$ref: $install_output"
assert_install_directory from-ref "$resolved_version"
pass "BRANCH=$ref"

echo "▶ a pinned version resolves its own twenty/<version> tag"
run_install pinned VERSION="$resolved_version"
[ "$install_status" -eq 0 ] || fail "install.sh failed with VERSION=$resolved_version: $install_output"
echo "$install_output" | grep -q "Github branch twenty/$resolved_version" || fail "VERSION=$resolved_version did not resolve twenty/$resolved_version"
assert_install_directory pinned "$resolved_version"
pass "VERSION=$resolved_version"

echo "▶ VERSION only accepts a full release tag"
for rejected_version in latest v2 v2.38 v2.40.0-rc.1; do
  run_install rejected VERSION="$rejected_version"
  [ "$install_status" -ne 0 ] || fail "VERSION=$rejected_version was accepted"
  echo "$install_output" | grep -q "full release tag" || fail "VERSION=$rejected_version did not explain the expected format: $install_output"
  [ ! -d rejected ] || fail "VERSION=$rejected_version created a directory before failing"
done
pass "latest, floating and pre-release tags are rejected before any download"

echo "▶ a release without a twenty/<version> tag aborts cleanly and keeps an existing config"
mkdir keep
echo "existing compose" > keep/docker-compose.yml
echo "EXISTING_ENV=1" > keep/.env
install_output=$(printf 'keep\ny\n' | VERSION=v2.9.0 "$scripts_dir/install.sh" 2>&1) && install_status=0 || install_status=$?
[ "$install_status" -ne 0 ] || fail "VERSION=v2.9.0 succeeded although twenty/v2.9.0 does not exist"
echo "$install_output" | grep -q "twenty/v2.9.0" || fail "the error does not name the missing ref: $install_output"
[ "$(cat keep/docker-compose.yml)" = "existing compose" ] || fail "existing docker-compose.yml was modified"
[ "$(cat keep/.env)" = "EXISTING_ENV=1" ] || fail "existing .env was modified"
! ls keep/*.tmp >/dev/null 2>&1 || fail "a .tmp download was left behind"
pass "VERSION=v2.9.0 fails without touching keep/"

echo "▶ 1-click.sh bootstraps install.sh from $ref and forwards the resolved version and branch"
run_one_click one-click BRANCH="$ref"
[ "$install_status" -eq 0 ] || fail "1-click.sh failed with BRANCH=$ref: $install_output"
echo "$install_output" | grep -q "Using docker version $resolved_version and Github branch $ref" || fail "1-click.sh did not forward VERSION and BRANCH: $install_output"
assert_install_directory one-click "$resolved_version"
[ ! -e twenty_install.sh ] || fail "1-click.sh left twenty_install.sh behind"
pass "1-click.sh BRANCH=$ref"

echo "▶ 1-click.sh rejects a non-release VERSION and propagates install failures"
run_one_click one-click-rejected VERSION=v2
[ "$install_status" -ne 0 ] || fail "1-click.sh accepted VERSION=v2"
echo "$install_output" | grep -q "full release tag" || fail "1-click.sh did not explain the expected format: $install_output"
run_one_click one-click-old VERSION=v2.9.0
[ "$install_status" -ne 0 ] || fail "1-click.sh exited 0 although the install failed"
[ ! -e twenty_install.sh ] || fail "1-click.sh left twenty_install.sh behind after failing"
[ ! -e twenty_install.sh.tmp ] || fail "1-click.sh left twenty_install.sh.tmp behind after failing"
pass "1-click.sh exit status and cleanup"

echo "All install script checks passed"
