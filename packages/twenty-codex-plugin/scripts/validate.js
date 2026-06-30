#!/usr/bin/env node

const metadata = require('./validators/metadata');
const assets = require('./validators/assets');
const skills = require('./validators/skills');
const references = require('./validators/references');
const crossDocContracts = require('./validators/cross-doc-contracts');
const setupHelper = require('./validators/setup-helper');

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
crossDocContracts.assertTwentyMcpFormattingContract(fail);
crossDocContracts.assertFrontComponentGuidance(fail);
crossDocContracts.assertCliGuidanceSplit(fail);
crossDocContracts.assertTestingGuidance(fail);
setupHelper.assertSetupHelper(fail);

if (failures.length > 0) {
  console.error('Twenty Codex plugin validation failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log('Twenty Codex plugin validation passed.');
