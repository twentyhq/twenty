pull_version=${VERSION:-$(curl -fsS "https://hub.docker.com/v2/repositories/twentycrm/twenty/tags" | grep -o '"name":"[^"]*"' | grep -v 'latest' | cut -d'"' -f4 | sort -V | tail -n1)}

if [[ -z "$pull_version" ]]; then
  echo "Error: Unable to fetch the latest version tag. Please check your network connection or the Docker Hub API response."
  exit 1
fi
# Release tags are namespaced since twenty/v2.9.1
pull_branch=${BRANCH:-twenty/$pull_version}

version_num=${pull_version#v}
target_version="0.32.4"

# We moved the install script to a different location in v0.32.4
if [[ -n "$BRANCH" ]] || [[ "$(printf '%s\n' "$target_version" "$version_num" | sort -V | head -n1)" != "$version_num" ]]; then
  install_url="https://raw.githubusercontent.com/twentyhq/twenty/$pull_branch/packages/twenty-docker/scripts/install.sh"
else
  install_url="https://raw.githubusercontent.com/twentyhq/twenty/$pull_branch/install.sh"
fi

if ! curl -fsSL --retry 3 --retry-delay 2 -o twenty_install.sh "$install_url"; then
  echo "Error: Failed to download the install script from $install_url"
  echo "If this is a 404, the release may be incomplete; anything else is usually GitHub"
  echo "rate limiting your network, in which case retrying in a minute will work."
  exit 1
fi

chmod +x twenty_install.sh
VERSION="$VERSION" BRANCH="$BRANCH" ./twenty_install.sh

rm twenty_install.sh
