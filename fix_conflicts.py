#!/usr/bin/env python3
import re
import sys

filepath = 'packages/twenty-server/src/engine/core-modules/i18n/locales/ja-JP.po'

print(f"Reading {filepath}...")
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

before_count = content.count('<<<<<<< HEAD')
print(f"Found {before_count} conflicts")

# Pattern: <<<<<<< HEAD\n(content)\n=======\n>>>>>>> origin/main\n
# Keep the HEAD content (translations from PR), remove the conflict markers
pattern = r'<<<<<<< HEAD\n(.*?)=======\n>>>>>>> origin/main\n'
resolved = re.sub(pattern, r'\1', content, flags=re.DOTALL)

after_count = resolved.count('<<<<<<< HEAD')
print(f"After resolution: {after_count} conflicts remaining")

print(f"Writing resolved content...")
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(resolved)

print("Done!")

