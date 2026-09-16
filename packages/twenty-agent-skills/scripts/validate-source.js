#!/usr/bin/env node

import * as metadata from './validators/metadata.js';
import * as assets from './validators/assets.js';
import * as skills from './validators/skills.js';
import * as references from './validators/references.js';
import * as crossDocContracts from './validators/cross-doc-contracts.js';
import * as setupHelper from './validators/setup-helper.js';

const failures = [];
const fail = (message) => failures.push(message);

metadata.assertJsonMetadata(fail);
metadata.assertNoBundledMcpConfig(fail);
metadata.assertInterfaceFields(fail);
metadata.assertMarketplaceTemplate(fail);
assets.assertAssets(fail);
skills.assertSkills(fail);
skills.assertSkillTriggerPhrases(fail);
skills.assertNoLegacySkillReferences(fail);
references.assertReferences(fail);
references.assertHowAppsWork(fail);
crossDocContracts.assertOperatingRulesSingleSource(fail);
crossDocContracts.assertTwentyMcpFormattingContract(fail);
crossDocContracts.assertFrontComponentGuidance(fail);
crossDocContracts.assertCliGuidanceSplit(fail);
crossDocContracts.assertTestingGuidance(fail);
setupHelper.assertSetupHelper(fail);

if (failures.length > 0) {
  console.error('Twenty Agent Skills source validation failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log('Twenty Agent Skills source validation passed.');
