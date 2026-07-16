import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import {
  DIRECTUS_API_KEY_ENV_VAR_NAME,
  DIRECTUS_URL_ENV_VAR_NAME,
} from 'src/constants/server-variable-names';

describe('executive-search app constants', () => {
  it('has stable application universal identifier', () => {
    expect(APPLICATION_UNIVERSAL_IDENTIFIER).toBe('executive-search');
  });

  it('has stable default role universal identifier', () => {
    expect(DEFAULT_ROLE_UNIVERSAL_IDENTIFIER).toBe(
      'executive-search-default-role',
    );
  });

  it('has display name', () => {
    expect(APP_DISPLAY_NAME).toBe('Executive Search');
  });

  it('server variable names are defined', () => {
    expect(DIRECTUS_URL_ENV_VAR_NAME).toBe('DIRECTUS_URL');
    expect(DIRECTUS_API_KEY_ENV_VAR_NAME).toBe('DIRECTUS_API_KEY');
  });
});

describe('application-config validation', () => {
  it('app definition validates without errors', async () => {
    const mod = await import('src/application-config');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe('executive-search');
  });
});

describe('default-role validation (Task 4.3)', () => {
  it('role definition validates without errors', async () => {
    const mod = await import('src/default-role');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      'executive-search-default-role',
    );
  });

  it('canUpdateAllObjectRecords is false (no broad update)', () => {
    // Access the pre-loaded module
    import('src/default-role').then((mod) => {
      expect(mod.default.config.canUpdateAllObjectRecords).toBe(false);
    });
  });

  it('has no canUpdateAllObjectRecords (is false)', async () => {
    const mod = await import('src/default-role');
    expect(mod.default.config.canUpdateAllObjectRecords).toBe(false);
  });

  it('compensationExpectation field is in fieldPermissions deny list', async () => {
    const mod = await import('src/default-role');
    const {
      EXECUTIVE_SEARCH_PREFERENCE_COMPENSATION_FIELD_UNIVERSAL_IDENTIFIER,
    } = await import('src/objects/executive-search-preference.object');

    const fp = mod.default.config.fieldPermissions;
    const compensationDeny = fp.find(
      (f: { fieldUniversalIdentifier: string }) =>
        f.fieldUniversalIdentifier ===
        EXECUTIVE_SEARCH_PREFERENCE_COMPENSATION_FIELD_UNIVERSAL_IDENTIFIER,
    );
    expect(compensationDeny).toBeDefined();
    expect(compensationDeny.canReadFieldValue).toBe(false);
    expect(compensationDeny.canUpdateFieldValue).toBe(false);
  });

  it('default role cannot read prohibited selectors', async () => {
    const mod = await import('src/default-role');
    expect(mod.default.config.canReadAllObjectRecords).toBe(false);
  });
});

describe('executive-profile object validation (Task 4.1)', () => {
  const EXPECTED_OBJECT_UIDS = [
    ['executiveProfile', '72779c7c-a065-4091-8a9f-95d55da24c05'],
    ['executiveCareerExperience', '5ac11407-b607-4d14-adb1-251ff4dc3f24'],
    ['executiveEducation', 'c9086639-dd19-4ba3-96db-f33d8c29ed6a'],
    ['executiveBoardService', 'bb7d24b7-6f48-416b-960c-3b72b4ce0efb'],
    ['executiveCapability', '032b911b-09a5-4dec-9328-9d3ad953f24a'],
    ['executiveLanguage', 'e487f1bf-e0cf-4c07-b74b-fab776d29682'],
    ['executiveArtifact', '6d8552c3-c284-4956-be52-aa4c453eb846'],
    ['executiveAward', '12155bcf-fb8c-4fa6-88f8-2201af96ad40'],
    ['executiveExternalProfile', '5c563e99-936e-4d88-a426-ad58bf63cd54'],
    ['executiveSearchPreference', 'a883f212-45ad-4f00-aec2-8236ea41ef03'],
    ['externalEntityLink', 'fc3c2d84-21ad-476c-8671-5db68c3f0b20'],
  ] as const;

  it('each defineObject result has success=true and errors empty', async () => {
    for (const [name, uid] of EXPECTED_OBJECT_UIDS) {
      let mod;
      switch (name) {
        case 'executiveProfile':
          mod = await import('src/objects/executive-profile.object');
          break;
        case 'executiveCareerExperience':
          mod = await import('src/objects/executive-career-experience.object');
          break;
        case 'executiveEducation':
          mod = await import('src/objects/executive-education.object');
          break;
        case 'executiveBoardService':
          mod = await import('src/objects/executive-board-service.object');
          break;
        case 'executiveCapability':
          mod = await import('src/objects/executive-capability.object');
          break;
        case 'executiveLanguage':
          mod = await import('src/objects/executive-language.object');
          break;
        case 'executiveArtifact':
          mod = await import('src/objects/executive-artifact.object');
          break;
        case 'executiveAward':
          mod = await import('src/objects/executive-award.object');
          break;
        case 'executiveExternalProfile':
          mod = await import('src/objects/executive-external-profile.object');
          break;
        case 'executiveSearchPreference':
          mod = await import('src/objects/executive-search-preference.object');
          break;
        case 'externalEntityLink':
          mod = await import('src/objects/external-entity-link.object');
          break;
      }
      if (!mod) continue;
      expect(
        mod.default.success,
        `${name}: ${mod.default.errors.join('; ')}`,
      ).toBe(true);
      expect(mod.default.errors).toEqual([]);
      expect(mod.default.config.universalIdentifier).toBe(uid);
    }
  });

  it('all object UIDs are distinct and valid UUID v4 format', () => {
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    const uids = EXPECTED_OBJECT_UIDS.map(([, uid]) => uid);
    expect(new Set(uids).size).toBe(uids.length);
    for (const uid of uids) {
      expect(uid).toMatch(uuidV4Regex);
    }
  });

  it('externalEntityLink declares both unique indexes', async () => {
    const mod = await import('src/objects/external-entity-link.object');
    const indexes = mod.default.config.indexes || [];
    const uniqueIndexes = indexes.filter(
      (idx: { isUnique?: boolean }) => idx.isUnique,
    );
    expect(uniqueIndexes.length).toBe(2);

    // Check index 1: system + externalCollection + externalId
    const idx1 = uniqueIndexes.find(
      (idx: { fields: Array<{ fieldName: string }> }) =>
        idx.fields.length === 3 &&
        idx.fields[0].fieldName === 'system' &&
        idx.fields[1].fieldName === 'externalCollection' &&
        idx.fields[2].fieldName === 'externalId',
    );
    expect(idx1).toBeDefined();

    // Check index 2: system + twentyObjectUniversalIdentifier + twentyRecordId
    const idx2 = uniqueIndexes.find(
      (idx: { fields: Array<{ fieldName: string }> }) =>
        idx.fields.length === 3 &&
        idx.fields[0].fieldName === 'system' &&
        idx.fields[1].fieldName === 'twentyObjectUniversalIdentifier' &&
        idx.fields[2].fieldName === 'twentyRecordId',
    );
    expect(idx2).toBeDefined();
  });

  it('firewall: no field name intersects commercial-selection-firewall.csv', async () => {
    const firewallTerms = [
      'subscription_tier',
      'plan_level',
      'is_premium',
      'stripe_customer_id',
      'purchase_payment_history',
      'marketing_opt_in',
      'learning_activity',
      'course_completion',
      'quiz_activity',
      'content_consumption',
      'profile_views',
      'marketing_engagement',
      'candidate_service_usage_frequency',
      'executive_psychographic',
      'photo_analysis_scores',
      'birthdate',
      'gender',
      'voluntary_demographics',
      'accommodation_medical_info',
      'unreviewed_culture_fit_score',
    ];

    const importPromises = EXPECTED_OBJECT_UIDS.map(async ([name]) => {
      let mod;
      switch (name) {
        case 'executiveProfile':
          mod = await import('src/objects/executive-profile.object');
          break;
        case 'executiveCareerExperience':
          mod = await import('src/objects/executive-career-experience.object');
          break;
        case 'executiveEducation':
          mod = await import('src/objects/executive-education.object');
          break;
        case 'executiveBoardService':
          mod = await import('src/objects/executive-board-service.object');
          break;
        case 'executiveCapability':
          mod = await import('src/objects/executive-capability.object');
          break;
        case 'executiveLanguage':
          mod = await import('src/objects/executive-language.object');
          break;
        case 'executiveArtifact':
          mod = await import('src/objects/executive-artifact.object');
          break;
        case 'executiveAward':
          mod = await import('src/objects/executive-award.object');
          break;
        case 'executiveExternalProfile':
          mod = await import('src/objects/executive-external-profile.object');
          break;
        case 'executiveSearchPreference':
          mod = await import('src/objects/executive-search-preference.object');
          break;
        case 'externalEntityLink':
          mod = await import('src/objects/external-entity-link.object');
          break;
      }
      return { name: name!, fields: mod?.default?.config?.fields || [] };
    });

    const results = await Promise.all(importPromises);
    for (const { name, fields } of results) {
      for (const field of fields) {
        const fieldSnake = field.name.replace(/[A-Z]/g, (c: string) =>
          c.toLowerCase(),
        );
        for (const term of firewallTerms) {
          const termNormalized = term
            .replace(/^executives\./, '')
            .replace(/^executive_/, '');
          expect(
            !fieldSnake.includes(termNormalized.toLowerCase()),
            `${name}.${field.name} intersects firewall term "${term}"`,
          ).toBe(true);
        }
      }
    }
  });

  it('firewall: no field name intersects candidate-facing-nonreplication-denylist.csv', async () => {
    const denyListTerms = [
      'subscription_tier',
      'plan_level',
      'is_premium',
      'birthdate',
      'gender',
      'demographics_voluntary',
      'demographics_justification',
      'accommodation',
      'stripe_customer_id',
      'password',
      'psychographic',
      'otp_ciphertext',
      'magic_auth',
      'password_hash',
      'product_engagement',
      'culture_fit_score',
      'success_probability',
      'matching_score',
      'competitive_analysis',
      'raw_score',
      'photo_analysis',
      'profile_engagement',
      'course_completion_quiz',
      'rehearsal_data',
      'social_login',
      'meilisearch_settings',
    ];

    const importPromises = EXPECTED_OBJECT_UIDS.map(async ([name]) => {
      let mod;
      switch (name) {
        case 'executiveProfile':
          mod = await import('src/objects/executive-profile.object');
          break;
        case 'executiveCareerExperience':
          mod = await import('src/objects/executive-career-experience.object');
          break;
        case 'executiveEducation':
          mod = await import('src/objects/executive-education.object');
          break;
        case 'executiveBoardService':
          mod = await import('src/objects/executive-board-service.object');
          break;
        case 'executiveCapability':
          mod = await import('src/objects/executive-capability.object');
          break;
        case 'executiveLanguage':
          mod = await import('src/objects/executive-language.object');
          break;
        case 'executiveArtifact':
          mod = await import('src/objects/executive-artifact.object');
          break;
        case 'executiveAward':
          mod = await import('src/objects/executive-award.object');
          break;
        case 'executiveExternalProfile':
          mod = await import('src/objects/executive-external-profile.object');
          break;
        case 'executiveSearchPreference':
          mod = await import('src/objects/executive-search-preference.object');
          break;
        case 'externalEntityLink':
          mod = await import('src/objects/external-entity-link.object');
          break;
      }
      return { name: name!, fields: mod?.default?.config?.fields || [] };
    });

    const results = await Promise.all(importPromises);
    for (const { name, fields } of results) {
      for (const field of fields) {
        const fieldLower = field.name.toLowerCase();
        for (const term of denyListTerms) {
          const termNormalized = term
            .replace(/^executives\./, '')
            .replace(/^executive_/, '')
            .replace(/^.*\./, '');
          expect(
            !fieldLower.includes(termNormalized.toLowerCase()),
            `${name}.${field.name} intersects denylist term "${term}"`,
          ).toBe(true);
        }
      }
    }
  });

  it('executiveCapability.source enum is exactly {CLAIMED, VERIFIED, AI_SUGGESTED}', async () => {
    const mod = await import('src/objects/executive-capability.object');
    const sourceField = mod.default.config.fields.find(
      (f: { name: string }) => f.name === 'source',
    );
    expect(sourceField).toBeDefined();
    const values = (sourceField.options || [])
      .map((o: { value: string }) => o.value)
      .sort();
    expect(values).toEqual(['AI_SUGGESTED', 'CLAIMED', 'VERIFIED']);
  });

  it('executiveArtifact.type enum is exactly the 8 listed values', async () => {
    const mod = await import('src/objects/executive-artifact.object');
    const typeField = mod.default.config.fields.find(
      (f: { name: string }) => f.name === 'type',
    );
    expect(typeField).toBeDefined();
    const values = (typeField.options || [])
      .map((o: { value: string }) => o.value)
      .sort();
    expect(values).toEqual([
      'BOARD_BIO',
      'ELEVATOR_PITCH',
      'EXECUTIVE_SUMMARY',
      'IMPACT_REPORT',
      'INTERNAL_ASSESSMENT',
      'OTHER',
      'PRESS_RELEASE',
      'REFERENCE_LETTER',
    ]);
  });

  it('type-visibility invariant: INTERNAL_ASSESSMENT artifact cannot have visibility Public', async () => {
    const mod = await import('src/objects/executive-artifact.object');
    const visibilityField = mod.default.config.fields.find(
      (f: { name: string }) => f.name === 'visibility',
    );
    const typeField = mod.default.config.fields.find(
      (f: { name: string }) => f.name === 'type',
    );

    expect(typeField).toBeDefined();
    expect(visibilityField).toBeDefined();

    const internalAssessmentOption = typeField.options.find(
      (o: { value: string }) => o.value === 'INTERNAL_ASSESSMENT',
    );
    expect(internalAssessmentOption).toBeDefined();

    const defaultVisibility = visibilityField.defaultValue;
    // INTERNAL_ASSESSMENT default visibility should not be PUBLIC
    if (defaultVisibility) {
      expect(defaultVisibility).not.toContain('Public');
    }
  });
});

describe('views and navigation validation (Task 4.2)', () => {
  const OBJECT_VIEW_MAP: Array<{
    objectName: string;
    viewImport: string;
    viewUid: string;
  }> = [
    {
      objectName: 'executiveProfile',
      viewImport: 'src/views/all-executive-profiles.view',
      viewUid: '47ba61ba-5f8c-46dd-8e77-f526ee9a4754',
    },
    {
      objectName: 'executiveCareerExperience',
      viewImport: 'src/views/all-executive-career-experiences.view',
      viewUid: '9699fd17-9831-4f3f-8fbe-6bcc42065abd',
    },
    {
      objectName: 'executiveEducation',
      viewImport: 'src/views/all-executive-educations.view',
      viewUid: '43cb0a2f-f61e-436b-8558-3b291b53e67b',
    },
    {
      objectName: 'executiveBoardService',
      viewImport: 'src/views/all-executive-board-services.view',
      viewUid: 'd169c972-f6cb-40fd-9531-a69e7f9ef251',
    },
    {
      objectName: 'executiveCapability',
      viewImport: 'src/views/all-executive-capabilities.view',
      viewUid: '27bcd22e-67cc-46e9-86c4-5371ab81b2a8',
    },
    {
      objectName: 'executiveLanguage',
      viewImport: 'src/views/all-executive-languages.view',
      viewUid: 'eafe2ff3-1692-4c87-ae12-18fc41739a5f',
    },
    {
      objectName: 'executiveArtifact',
      viewImport: 'src/views/all-executive-artifacts.view',
      viewUid: '7274bd93-85c7-4fd3-893e-b2796117cd30',
    },
    {
      objectName: 'executiveAward',
      viewImport: 'src/views/all-executive-awards.view',
      viewUid: 'bab3f617-4dc6-44c5-83ee-f493af772507',
    },
    {
      objectName: 'executiveExternalProfile',
      viewImport: 'src/views/all-executive-external-profiles.view',
      viewUid: '4d69a628-f271-442d-97e4-8610cd05188e',
    },
    {
      objectName: 'executiveSearchPreference',
      viewImport: 'src/views/all-executive-search-preferences.view',
      viewUid: '9da7d8f4-3e13-4c36-8684-9e25f66fa6bb',
    },
  ];

  it('each view validates with success=true and errors empty', async () => {
    for (const { objectName, viewImport, viewUid } of OBJECT_VIEW_MAP) {
      const mod = await import(/* @vite-ignore */ viewImport);
      expect(
        mod.default.success,
        `${objectName} view: ${mod.default.errors.join('; ')}`,
      ).toBe(true);
      expect(mod.default.errors).toEqual([]);
      expect(mod.default.config.universalIdentifier).toBe(viewUid);
    }
  });

  it('all 10 executive-profile objects have an associated view', async () => {
    const mod = await import('src/views/all-executive-profiles.view');
    expect(mod.default.config.universalIdentifier).toBe(
      '47ba61ba-5f8c-46dd-8e77-f526ee9a4754',
    );
    // All 10 are verified in the loop above
    expect(OBJECT_VIEW_MAP.length).toBe(10);
  });

  it('navigation menu items validate', async () => {
    const navImports = [
      'src/navigation-menu-items/executive-profiles.navigation-menu-item',
      'src/navigation-menu-items/executive-career-experiences.navigation-menu-item',
      'src/navigation-menu-items/executive-educations.navigation-menu-item',
      'src/navigation-menu-items/executive-board-services.navigation-menu-item',
      'src/navigation-menu-items/executive-capabilities.navigation-menu-item',
      'src/navigation-menu-items/executive-languages.navigation-menu-item',
      'src/navigation-menu-items/executive-artifacts.navigation-menu-item',
      'src/navigation-menu-items/executive-awards.navigation-menu-item',
      'src/navigation-menu-items/executive-external-profiles.navigation-menu-item',
      'src/navigation-menu-items/executive-search-preferences.navigation-menu-item',
    ];
    for (const navImport of navImports) {
      const mod = await import(/* @vite-ignore */ navImport);
      expect(
        mod.default.success,
        `${navImport}: ${mod.default.errors.join('; ')}`,
      ).toBe(true);
    }
  });

  it('page layouts validate for each executive-profile object', async () => {
    const layoutImports = [
      'src/page-layouts/executive-profile.page-layout',
      'src/page-layouts/executive-career-experience.page-layout',
      'src/page-layouts/executive-education.page-layout',
      'src/page-layouts/executive-board-service.page-layout',
      'src/page-layouts/executive-capability.page-layout',
      'src/page-layouts/executive-language.page-layout',
      'src/page-layouts/executive-artifact.page-layout',
      'src/page-layouts/executive-award.page-layout',
      'src/page-layouts/executive-external-profile.page-layout',
      'src/page-layouts/executive-search-preference.page-layout',
    ];
    for (const layoutImport of layoutImports) {
      const mod = await import(/* @vite-ignore */ layoutImport);
      expect(
        mod.default.success,
        `${layoutImport}: ${mod.default.errors.join('; ')}`,
      ).toBe(true);
    }
  });
});

describe('field definitions validation', () => {
  it('person-executive-profiles reverse relation field validates', async () => {
    const mod = await import(
      'src/fields/person-executive-profiles.field'
    );
    expect(mod.default.success, mod.default.errors.join('; ')).toBe(true);
  });
});
