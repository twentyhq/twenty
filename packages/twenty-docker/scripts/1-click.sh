# "latest" is only an alias of the newest release, resolve it to the real tag
[[ "$VERSION" == "latest" ]] && unset VERSION

pull_version=${VERSION:-$(curl -fsS --retry 3 --retry-delay 2 "https://hub.docker.com/v2/repositories/twentycrm/twenty/tags?page_size=100" | grep -o '"name":"[^"]*"' | grep -v 'latest' | cut -d'"' -f4 | sort -V | tail -n1)}

if [[ -z "$pull_version" ]]; then
  echo "Error: Unable to fetch the latest version tag. Please check your network connection or the Docker Hub API response."
  exit 1
fi
# Release tags are namespaced since twenty/v2.9.1, older releases are not supported
pull_branch=${BRANCH:-twenty/$pull_version}

install_url="https://raw.githubusercontent.com/twentyhq/twenty/$pull_branch/packages/twenty-docker/scripts/install.sh"

if ! curl -fsSL --retry 3 --retry-delay 2 -o twenty_install.sh "$install_url"; then
  rm -f twenty_install.sh
  echo "Error: Failed to download the install script from $install_url"
  echo "If this is a 404, the release may be incomplete; anything else is usually GitHub"
  echo "rate limiting your network, in which case retrying in a minute will work."
  exit 1
fi

chmod +x twenty_install.sh
# Pass the resolved values down so the tagged install.sh does not resolve them again
VERSION="$pull_version" BRANCH="$pull_branch" ./twenty_install.sh

rm twenty_install.sh
