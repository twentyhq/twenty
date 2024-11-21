version=${VERSION:-$(curl -s https://api.github.com/repos/twentyhq/twenty/releases/latest | grep '"tag_name":' | cut -d '"' -f 4)}
branch=${BRANCH:-$version}

version_num=${version#v}
target_version="0.32.4"

# We moved the install script to a different location in v0.32.4
if [[ -n "$branch" ]] || [[ "$(printf '%s\n' "$target_version" "$version_num" | sort -V | head -n1)" != "$version_num" ]]; then
  curl -sL "https://raw.githubusercontent.com/twentyhq/twenty/$branch/packages/twenty-docker/scripts/install.sh" | bash -s -- "$version" "$branch"
else
  curl -sL "https://raw.githubusercontent.com/twentyhq/twenty/$branch/install.sh" | bash -s -- "$version" "$branch"
fi
