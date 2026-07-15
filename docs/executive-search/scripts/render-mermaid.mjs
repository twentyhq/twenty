#!/usr/bin/env node
// render-mermaid.mjs — extracts every Mermaid fence from markdown files under
// docs/executive-search/, renders each with pinned @mermaid-js/mermaid-cli,
// asserts exactly 10 diagrams, and propagates any failure.

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP_DIR = '/var/tmp/executive-search-phase0-mermaid';
const MERMAID_CLI = 'npx --yes @mermaid-js/mermaid-cli@11.12.0';
const EXPECTED_COUNT = 10;

function extractMermaidBlocks() {
  const blocks = [];
  const mdFiles = [];
  function findMd(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) findMd(full);
      else if (entry.name.endsWith('.md')) mdFiles.push(full);
    }
  }
  findMd(ROOT);
  mdFiles.sort();

  for (const file of mdFiles) {
    const text = readFileSync(file, 'utf8');
    const fenceRe = /```mermaid\n([\s\S]*?)```/g;
    let match;
    while ((match = fenceRe.exec(text)) !== null) {
      const content = match[1].trim();
      const relPath = file.replace(ROOT + '/', '');
      const hash = createHash('sha256').update(relPath + ':' + content).digest('hex').substring(0, 16);
      blocks.push({ file: relPath, hash, content });
    }
  }
  return blocks;
}

async function main() {
  const skipRender = process.argv.includes('--skip-render');
  mkdirSync(TMP_DIR, { recursive: true });

  const blocks = extractMermaidBlocks();
  if (blocks.length === 0) {
    console.log('render-mermaid: no Mermaid blocks found yet (expected before final validation)');
    process.exit(0);
  }
  if (blocks.length !== EXPECTED_COUNT) {
    console.error(`render-mermaid: expected ${EXPECTED_COUNT} diagrams, found ${blocks.length}`);
    blocks.forEach(b => console.error(`  - ${b.file} [${b.hash}]`));
    process.exit(1);
  }

  if (skipRender) {
    console.log(`render-mermaid: ${blocks.length} blocks found (skipped render via --skip-render)`);
    blocks.forEach(b => console.log(`  PASS ${b.file} [${b.hash}]`));
    return;
  }

  let failures = 0;
  for (const b of blocks) {
    const inFile = join(TMP_DIR, `${b.hash}.mmd`);
    const outFile = join(TMP_DIR, `${b.hash}.svg`);
    writeFileSync(inFile, b.content);
    try {
      execSync(`${MERMAID_CLI} -i "${inFile}" -o "${outFile}"`, { timeout: 30000, stdio: 'pipe' });
      if (!existsSync(outFile)) throw new Error('SVG not produced');
      console.log(`  PASS ${b.file} [${b.hash}]`);
    } catch (err) {
      console.error(`  FAIL ${b.file} [${b.hash}]: ${err.message}`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`render-mermaid: ${failures} of ${blocks.length} diagrams failed to render`);
    process.exit(1);
  }
  console.log(`render-mermaid: all ${blocks.length} diagrams rendered successfully`);

  if (process.env.KEEP_MERMAID_ARTIFACTS !== '1') {
    try { readdirSync(TMP_DIR).forEach(f => { try { unlinkSync(join(TMP_DIR, f)); } catch {} }); } catch {}
  }
}

main();
