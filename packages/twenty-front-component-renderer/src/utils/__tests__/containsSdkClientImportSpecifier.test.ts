import { containsSdkClientImportSpecifier } from '../containsSdkClientImportSpecifier';

describe('containsSdkClientImportSpecifier', () => {
  it('returns true when the source imports an sdk client module', () => {
    expect(
      containsSdkClientImportSpecifier(
        "import { getClient } from 'twenty-client-sdk/core';",
      ),
    ).toBe(true);
    expect(
      containsSdkClientImportSpecifier(
        "import { getMetadata } from 'twenty-client-sdk/metadata';",
      ),
    ).toBe(true);
  });

  it('returns false when the source does not import an sdk client module', () => {
    expect(
      containsSdkClientImportSpecifier("import { useState } from 'react';"),
    ).toBe(false);
  });
});
