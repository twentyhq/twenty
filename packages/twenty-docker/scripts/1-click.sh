version=${VERSION:-$(curl -s https://api.github.com/repos/twentyhq/twenty/releases/latest | grep '"tag_name":' | cut -d '"' -f 4)}
branch=${BRANCH:-$version}

if [[ "$version" == "v0.32.4" || "$version" > "v0.32.4" || -n "$branch" ]]; then
  curl -sL "https://raw.githubusercontent.com/twentyhq/twenty/$branch/packages/twenty-docker/scripts/install.sh" | bash -s -- "$version" "$branch"
else
  curl -sL "https://raw.githubusercontent.com/twentyhq/twenty/$branch/install.sh" | bash -s -- "$version" "$branch"
fi
