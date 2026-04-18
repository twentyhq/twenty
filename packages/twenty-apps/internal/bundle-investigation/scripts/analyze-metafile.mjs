#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../out');

const TOP_PACKAGES = 20;
const TOP_FILES = 15;

function packageOf(file) {
  const idx = file.lastIndexOf('node_modules/');
  if (idx === -1) return '<app source>';
  const after = file.slice(idx + 'node_modules/'.length);
  const parts = after.split('/');
  return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function analyze(metaPath) {
  const meta = JSON.parse(await readFile(metaPath, 'utf8'));
  const outputKey = Object.keys(meta.outputs).find((k) => k.endsWith('.mjs'));
  const output = meta.outputs[outputKey];

  console.log(`\n========================================`);
  console.log(`  ${metaPath.split('/').pop()}`);
  console.log(`========================================`);
  console.log(`Bundle size: ${fmt(output.bytes)}`);
  console.log(`Inputs:      ${Object.keys(output.inputs).length} files`);

  const byPkg = new Map();
  const byFile = [];
  for (const [file, info] of Object.entries(output.inputs)) {
    const pkg = packageOf(file);
    byPkg.set(pkg, (byPkg.get(pkg) ?? 0) + info.bytesInOutput);
    byFile.push({ file, bytes: info.bytesInOutput });
  }

  const total = [...byPkg.values()].reduce((a, b) => a + b, 0);
  console.log(`Bytes in output (sum of inputs): ${fmt(total)}\n`);

  const sortedPkgs = [...byPkg.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`Top ${TOP_PACKAGES} packages:`);
  console.log(`  ${'package'.padEnd(40)}  ${'bytes'.padStart(12)}  ${'%'.padStart(6)}`);
  for (const [pkg, bytes] of sortedPkgs.slice(0, TOP_PACKAGES)) {
    const pct = ((bytes / total) * 100).toFixed(1);
    console.log(`  ${pkg.padEnd(40)}  ${fmt(bytes).padStart(12)}  ${pct.padStart(5)}%`);
  }

  const sortedFiles = byFile.sort((a, b) => b.bytes - a.bytes).slice(0, TOP_FILES);
  console.log(`\nTop ${TOP_FILES} individual files:`);
  for (const { file, bytes } of sortedFiles) {
    console.log(`  ${fmt(bytes).padStart(10)}  ${file}`);
  }
}

const metaFiles = (await readdir(OUT_DIR))
  .filter((f) => f.endsWith('.meta.json'))
  .sort();

for (const f of metaFiles) {
  await analyze(join(OUT_DIR, f));
}
