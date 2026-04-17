const fs = require('node:fs');

function loadEnvFile(dotenvPath) {
  const text = fs.readFileSync(dotenvPath, 'utf8');
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1);
  }
  return out;
}

async function gql({ url, token, query, variables }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return { status: res.status, json };
}

async function main() {
  const env = loadEnvFile('\\\\wsl$\\Ubuntu\\home\\clive\\_Projects\\stratum\\.env');
  const base = (env.TWENTY_UAT_URL || '').replace(/\/$/, '');
  const token = env.TWENTY_UAT_API_KEY || '';
  if (!base || !token) throw new Error('Missing TWENTY_UAT_URL or TWENTY_UAT_API_KEY');

  const url = `${base}/metadata`;

  const meta = await gql({
    url,
    token,
    query: `query {
      minimalMetadata {
        objectMetadataItems { id nameSingular labelSingular }
      }
    }`,
    variables: {},
  });

  const quote = meta.json?.data?.minimalMetadata?.objectMetadataItems?.find(
    (o) => o.nameSingular === 'quote',
  );
  if (!quote) {
    console.log('QUOTE_NOT_FOUND');
    return;
  }

  console.log('quoteObjectId', quote.id);

  const layouts = [];
  // Try unfiltered first (sanity check)
  const allLayouts = await gql({
    url,
    token,
    query: `query {
      getPageLayouts { id pageLayoutType objectMetadataId }
    }`,
    variables: {},
  });
  const all = allLayouts.json?.data?.getPageLayouts ?? [];
  console.log('allLayoutsCount', all.length);

  for (const pageLayoutType of ['RECORD_PAGE', 'RECORD_INDEX']) {
    const pls = await gql({
      url,
      token,
      query: `query($oid: String, $t: PageLayoutType) {
        getPageLayouts(objectMetadataId: $oid, pageLayoutType: $t) {
          id
          pageLayoutType
          objectMetadataId
        }
      }`,
      variables: { oid: String(quote.id), t: pageLayoutType },
    });
    const found = pls.json?.data?.getPageLayouts ?? [];
    console.log(`layouts(${pageLayoutType})`, found);
    layouts.push(...found);
  }

  for (const pl of layouts) {
    const tabs = await gql({
      url,
      token,
      query: `query($id: String!) {
        getPageLayoutTabs(pageLayoutId: $id) { id title position pageLayoutId }
      }`,
      variables: { id: String(pl.id) },
    });

    const tabList = tabs.json?.data?.getPageLayoutTabs ?? [];
    console.log(
      'layout',
      pl.id,
      'tabs',
      tabList.map((t) => ({ id: t.id, title: t.title, position: t.position })),
    );

    for (const t of tabList) {
      const ws = await gql({
        url,
        token,
        query: `query($id: String!) {
          getPageLayoutWidgets(pageLayoutTabId: $id) {
            id
            type
            position
            configuration
          }
        }`,
        variables: { id: String(t.id) },
      });

      const widgets = ws.json?.data?.getPageLayoutWidgets ?? [];

      const sectionsLike =
        typeof t.title === 'string' && t.title.toLowerCase().includes('section');
      if (sectionsLike) {
        console.log('SECTIONS_TAB', { tabId: t.id, title: t.title, widgets });
      }

      const fc = widgets.filter(
        (w) => w?.configuration?.__typename === 'FrontComponentConfiguration',
      );
      if (fc.length) {
        console.log(
          'frontComponentWidgetsOnTab',
          t.title,
          fc.map((w) => ({
            id: w.id,
            frontComponentId: w.configuration.frontComponentId,
            position: w.position,
          })),
        );
      }
    }
  }
}

main().catch((e) => {
  console.error(e?.stack || e);
  process.exit(1);
});

