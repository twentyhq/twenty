#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { PACKAGE_ROOT, buildPortableSkills, diffDirectories } = require('./lib');

const skillsRoot = path.join(PACKAGE_ROOT, 'skills');
const checkMode = process.argv.includes('--check');

if (!checkMode) {
  buildPortableSkills({ outputRoot: skillsRoot });
  console.log('Portable Twenty agent skills generated in skills/.');
  process.exit(0);
}

const stagingRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'twenty-agent-skills-'),
);

try {
  buildPortableSkills({ outputRoot: stagingRoot });

  const differences = diffDirectories(stagingRoot, skillsRoot);

  if (differences.length > 0) {
    console.error(
      'skills/ is out of sync with the canonical content in packages/twenty-codex-plugin:',
    );

    for (const difference of differences) {
      console.error(`- ${difference}`);
    }

    console.error(
      'Run `npx nx run twenty-agent-skills:build` and commit the result.',
    );
    process.exit(1);
  }

  console.log(
    'Portable Twenty agent skills are in sync with the canonical content.',
  );
} finally {
  fs.rmSync(stagingRoot, { recursive: true, force: true });
}
