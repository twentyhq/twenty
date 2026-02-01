#!/bin/bash

# Post-processing script to fix internal links in translated documentation
# This script adds the locale prefix to all internal documentation links
# Works for any language by automatically detecting language directories

set -e

if [ -d "packages/twenty-docs" ]; then
  DOCS_DIR="packages/twenty-docs/l"
elif [ -d "l" ]; then
  DOCS_DIR="l"
else
  echo "❌ Error: Cannot find locales directory (l/)"
  exit 1
fi

echo "🔧 Fixing internal links in translated documentation..."

for lang_dir in "$DOCS_DIR"/*/ ; do
  lang_code=$(basename "$lang_dir")

  if [ ! -d "$lang_dir" ] || [ -z "$(ls -A "$lang_dir")" ]; then
    continue
  fi

  echo "📝 Processing $lang_code documentation..."

  # Use different sed syntax for macOS compatibility if needed, but standard -i works on minimal linux
  # using -i.bak is safer for BSD/Mac compatibility too

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/user-guide/|href=\"/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/developers/|href=\"/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/twenty-ui/|href=\"/l/$lang_code/twenty-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/user-guide/|](/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/developers/|](/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/twenty-ui/|](/l/$lang_code/twenty-ui/|g" {} \;

  # Fix absolute links to docs.twenty.com
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.twenty\.com/user-guide/|https://docs.twenty.com/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.twenty\.com/developers/|https://docs.twenty.com/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.twenty\.com/twenty-ui/|https://docs.twenty.com/l/$lang_code/twenty-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.twenty\.com/user-guide/|https://docs.twenty.com/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.twenty\.com/developers/|https://docs.twenty.com/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.twenty\.com/twenty-ui/|https://docs.twenty.com/$lang_code/twenty-ui/|g" {} \;

  find "$lang_dir" -name "*.bak" -type f -delete

  echo "✅ $lang_code documentation links fixed"
done

echo "🎉 All translated links have been fixed!"
