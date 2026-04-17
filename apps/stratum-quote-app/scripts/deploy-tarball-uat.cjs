const fs = require('node:fs');
const path = require('node:path');

function loadEnvFile(dotenvPath) {
  const text = fs.readFileSync(dotenvPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1);
    process.env[k] = v;
  }
}

async function main() {
  const dotenvPath = '\\\\wsl$\\Ubuntu\\home\\clive\\_Projects\\stratum\\.env';
  loadEnvFile(dotenvPath);

  const apiUrl = process.env.TWENTY_UAT_URL;
  const apiKey = process.env.TWENTY_UAT_API_KEY;
  if (!apiUrl) throw new Error('Missing TWENTY_UAT_URL in .env');
  if (!apiKey) throw new Error('Missing TWENTY_UAT_API_KEY in .env');

  // twenty-sdk reads env config only when TWENTY_API_URL + TWENTY_TOKEN are set.
  // TWENTY_TOKEN can be an API key (it will be used as Bearer token).
  process.env.TWENTY_API_URL = apiUrl.replace(/\/$/, '');
  process.env.TWENTY_TOKEN = apiKey;

  const tarballPath = path.join(process.cwd(), 'stratum-quote-app-0.1.14.tgz');
  const { appBuild, appDeploy } = require('twenty-sdk/cli');

  const buildResult = await appBuild({
    appPath: process.cwd(),
    tarball: true,
    onProgress: (m) => process.stdout.write(String(m) + '\n'),
  });

  if (!buildResult.success || !buildResult.data?.tarballPath) {
    throw new Error(buildResult.error?.message ?? 'Build failed');
  }

  const builtTarballPath = buildResult.data.tarballPath;
  const friendlyTarballPath = tarballPath;
  if (builtTarballPath !== friendlyTarballPath) {
    fs.copyFileSync(builtTarballPath, friendlyTarballPath);
  }

  const res = await appDeploy({
    tarballPath: friendlyTarballPath,
    onProgress: (m) => process.stdout.write(String(m) + '\n'),
  });

  if (!res.success) {
    throw new Error(res.error?.message ?? 'Deploy failed');
  }

  process.stdout.write('DEPLOY_OK\n');
}

main().catch((e) => {
  process.stderr.write((e && e.stack) || String(e));
  process.stderr.write('\n');
  process.exit(1);
});

