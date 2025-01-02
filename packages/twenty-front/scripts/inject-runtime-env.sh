#!/bin/sh

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
<!-- BEGIN: Twenty Config -->
    <script id="twenty-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL"
      };
    </script>
<!-- END: Twenty Config -->
EOF
)

# Use sed to replace the config block in index.html
# The .* is non-greedy in sed by default
sed -i.bak "s|<!-- BEGIN: Twenty Config -->.*<!-- END: Twenty Config -->|$CONFIG_BLOCK|" build/index.html
rm -f build/index.html.bak
