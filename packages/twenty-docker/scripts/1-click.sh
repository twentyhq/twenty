pull_version=${VERSION:-$(curl -s https://api.github.com/repos/twentyhq/twenty/releases/latest | grep '"tag_name":' | cut -d '"' -f 4)}
pull_branch=${BRANCH:-$pull_version}

version_num=${pull_version#v}
target_version="0.32.4"

# We moved the install script to a different location in v0.32.4
if [[ -n "$BRANCH" ]] || [[ "$(printf '%s\n' "$target_version" "$version_num" | sort -V | head -n1)" != "$version_num" ]]; then
  curl -sL "https://raw.githubusercontent.com/twentyhq/twenty/$pull_branch/packages/twenty-docker/scripts/install.sh" | bash -s -- "$VERSION" "$BRANCH"
else
  curl -sL "https://raw.githubusercontent.com/twentyhq/twenty/$pull_branch/install.sh" | bash -s -- "$VERSION" "$BRANCH"
fi
