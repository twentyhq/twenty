import { describe, expect, it } from 'vitest';

import { restoreTranslatedAttributes } from '../restore-translated-attributes';

describe('restoreTranslatedAttributes', () => {
  it('restores icons, links and image paths while keeping the translated text', () => {
    const source = [
      '<Card title="Next: HTTP routes" icon="globe" href="/developers/extend/apps/http-routes">',
      '  Serve the document as a web page.',
      '</Card>',
      '',
      '<img src="/images/docs/developers/data-model.png" alt="Data model setup" />',
    ].join('\n');
    const translation = [
      '<Card title="Siguiente: rutas HTTP" icon="globo" href="/Developopers/extend/apps/http-routes">',
      '  Sirve el documento como una página web.',
      '</Card>',
      '',
      '<img src="/images/docs/desarrolladores/data-model.png" alt="Configuración del modelo de datos" />',
    ].join('\n');

    expect(
      restoreTranslatedAttributes({ source, translation, language: 'es' }),
    ).toEqual({
      content: [
        '<Card title="Siguiente: rutas HTTP" icon="globe" href="/es/developers/extend/apps/http-routes">',
        '  Sirve el documento como una página web.',
        '</Card>',
        '',
        '<img src="/images/docs/developers/data-model.png" alt="Configuración del modelo de datos" />',
      ].join('\n'),
      restoredCount: 3,
      unrestoredCount: 0,
    });
  });

  it.each([
    [
      'ar',
      '<CardGroup cols={2}>\n  <Card title="Partners">Find one.</Card>\n</CardGroup>',
      '<CardGroup cols={٢}>\n  <Card title="الشركاء">اعثر على شريك.</Card>\n</CardGroup>',
      '<CardGroup cols={2}>\n  <Card title="الشركاء">اعثر على شريك.</Card>\n</CardGroup>',
    ],
    [
      'tr',
      '<img src="/images/kanban.png" style={{width:\'100%\'}} />',
      '<img src="/images/kanban.png" style={{genişlik:\'100%\'}} />',
      '<img src="/images/kanban.png" style={{width:\'100%\'}} />',
    ],
  ] as const)(
    'restores a translated expression (%s), even one that no longer parses',
    (language, source, translation, expected) => {
      expect(
        restoreTranslatedAttributes({ source, translation, language }).content,
      ).toBe(expected);
    },
  );

  it('ignores whitespace Crowdin changes inside an expression', () => {
    const translation = "<div style={{textAlign: 'center'}}>\n  Hola\n</div>";

    expect(
      restoreTranslatedAttributes({
        source: "<div style={{ textAlign: 'center' }}>\n  Hello\n</div>",
        translation,
        language: 'es',
      }),
    ).toEqual({ content: translation, restoredCount: 0, unrestoredCount: 0 });
  });

  it('keeps values found elsewhere on the English page, as when cards were reordered', () => {
    const source = [
      '<Card title="Billing" icon="credit-card" href="/user-guide/billing/overview" />',
      '<Card title="Usage" icon="gauge" href="/user-guide/billing/usage-limits" />',
    ].join('\n');
    const translation = [
      '<Card title="Utilisation" icon="gauge" href="/fr/user-guide/billing/usage-limits" />',
      '<Card title="Facturation" icon="credit-card" href="/fr/user-guide/billing/overview" />',
    ].join('\n');

    expect(
      restoreTranslatedAttributes({ source, translation, language: 'fr' }),
    ).toEqual({ content: translation, restoredCount: 0, unrestoredCount: 0 });
  });

  it('on a page that drifted from the English one, restores only the elements it can identify', () => {
    const source = [
      '<Card title="Pricing" icon="tags" href="/user-guide/billing/pricing-plans" />',
      '<Card title="Usage" icon="gauge" href="/user-guide/billing/usage-limits" />',
      '<Card title="FAQ" icon="circle-question" href="/user-guide/billing/billing-faq" />',
    ].join('\n');
    const translation = [
      '<Card title="خطط التسعير" icon="tags" href="/ar/user-guide/billing/خطط التسعير" />',
      '<Card title="الأسئلة الشائعة" icon="سؤال" href="/userer-guide/billing/billing-faq" />',
      '<a href="/ar/user-guide/billing/overview">الفوترة</a>',
    ].join('\n');

    expect(
      restoreTranslatedAttributes({ source, translation, language: 'ar' }),
    ).toEqual({
      content: [
        '<Card title="خطط التسعير" icon="tags" href="/ar/user-guide/billing/pricing-plans" />',
        '<Card title="الأسئلة الشائعة" icon="سؤال" href="/userer-guide/billing/billing-faq" />',
        '<a href="/ar/user-guide/billing/overview">الفوترة</a>',
      ].join('\n'),
      restoredCount: 1,
      unrestoredCount: 2,
    });
  });
});
