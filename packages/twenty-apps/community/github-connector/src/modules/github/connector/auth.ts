import { createSign } from 'crypto';

export function normalizePem(raw: string): string {
  let pem = raw.replace(/\\n/g, '\n').trim();

  if (!pem.includes('\n')) {
    const beginMatch = pem.match(/^(-----BEGIN [A-Z ]+-----)/);
    const endMatch = pem.match(/(-----END [A-Z ]+-----)$/);

    if (beginMatch && endMatch) {
      const header = beginMatch[1];
      const footer = endMatch[1];
      const body = pem.slice(header.length, pem.length - footer.length);
      const lines = body.match(/.{1,64}/g) ?? [];
      pem = [header, ...lines, footer].join('\n');
    }
  }

  return pem;
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function signJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId }),
  );

  const signature = createSign('RSA-SHA256')
    .update(`${header}.${payload}`)
    .sign(privateKey, 'base64url');

  return `${header}.${payload}.${signature}`;
}

type CachedToken = { token: string; expiresAt: number };
let cached: CachedToken | null = null;

const TOKEN_MARGIN_MS = 5 * 60 * 1000;

async function requestInstallationToken(
  appId: string,
  privateKey: string,
  installationId: string,
): Promise<CachedToken> {
  const jwt = signJwt(appId, privateKey);

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub App token exchange failed (${res.status}): ${body}`,
    );
  }

  const data = (await res.json()) as {
    token: string;
    expires_at: string;
  };

  return {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  };
}

function assertFineGrainedPat(token: string): void {
  if (token.startsWith('github_pat_')) return;
  throw new Error(
    'GITHUB_TOKEN must be a fine-grained Personal Access Token (starts with `github_pat_`). Classic PATs are not supported — create one at https://github.com/settings/personal-access-tokens.',
  );
}

export async function getGitHubToken(): Promise<string> {
  const pat = process.env.GITHUB_TOKEN?.trim();
  if (pat) {
    assertFineGrainedPat(pat);
    return pat;
  }

  if (cached && Date.now() < cached.expiresAt - TOKEN_MARGIN_MS) {
    return cached.token;
  }

  const appId = process.env.GITHUB_APP_ID;
  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !rawKey || !installationId) {
    const missing = [
      !appId && 'GITHUB_APP_ID',
      !rawKey && 'GITHUB_APP_PRIVATE_KEY',
      !installationId && 'GITHUB_APP_INSTALLATION_ID',
    ]
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Missing GitHub credentials. Set GITHUB_TOKEN (fine-grained PAT) or all of: ${missing}.`,
    );
  }

  const privateKey = normalizePem(rawKey);
  cached = await requestInstallationToken(appId, privateKey, installationId);

  return cached.token;
}
