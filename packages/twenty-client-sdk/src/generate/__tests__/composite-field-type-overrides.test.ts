import { describe, expect, it } from 'vitest';

import { applyCompositeFieldTypeOverrides } from '../composite-field-type-overrides';

const generatedInterface = (name: string, body: string) =>
  `export interface ${name} {\n${body}\n}\n`;

describe('applyCompositeFieldTypeOverrides', () => {
  it('replaces the JSON scalar with the real shape in a response type', () => {
    const source = generatedInterface(
      'Emails',
      "    primaryEmail?: Scalars['String']\n    additionalEmails?: Scalars['JSON']\n    __typename: 'Emails'",
    );

    expect(applyCompositeFieldTypeOverrides(source)).toContain(
      'additionalEmails?: string[]',
    );
  });

  it('preserves the engine nullability wrapping in an input type', () => {
    const source =
      "export interface EmailsCreateInput {primaryEmail?: (Scalars['String'] | null),additionalEmails?: (Scalars['JSON'] | null)}\n";

    expect(applyCompositeFieldTypeOverrides(source)).toContain(
      'additionalEmails?: (string[] | null)',
    );
  });

  it('leaves a same-named field on a non-composite type untouched', () => {
    const source =
      generatedInterface(
        'Emails',
        "    additionalEmails?: Scalars['JSON']\n    __typename: 'Emails'",
      ) +
      generatedInterface(
        'EmailsDraft',
        "    additionalEmails?: Scalars['JSON']\n    __typename: 'EmailsDraft'",
      );

    const overridden = applyCompositeFieldTypeOverrides(source);

    expect(overridden).toContain(
      "export interface EmailsDraft {\n    additionalEmails?: Scalars['JSON']",
    );
    expect(overridden).toContain(
      'export interface Emails {\n    additionalEmails?: string[]',
    );
  });

  it('skips composite types the schema does not expose', () => {
    const source = generatedInterface(
      'Emails',
      "    additionalEmails?: Scalars['JSON']",
    );

    expect(() => applyCompositeFieldTypeOverrides(source)).not.toThrow();
  });

  it('throws when a composite field stops rendering as the JSON scalar', () => {
    const source = generatedInterface(
      'Emails',
      "    primaryEmail?: Scalars['String']\n    additionalEmails?: Scalars['JSONObject']",
    );

    expect(() => applyCompositeFieldTypeOverrides(source)).toThrow(
      'Expected Emails.additionalEmails to render as the JSON scalar',
    );
  });

  it('throws when the composite interface block is not closed', () => {
    const source =
      "export interface Emails {\n    additionalEmails?: Scalars['JSON']\n";

    expect(() => applyCompositeFieldTypeOverrides(source)).toThrow(
      'Unbalanced braces',
    );
  });
});
