import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';

import { findApplicationViewFieldIdsOnForeignViews } from 'src/database/commands/upgrade-version-command/2-61/utils/find-application-view-field-ids-on-foreign-views.util';

const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000003';

const STANDARD_VIEW_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_APPLICATION_VIEW_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';
const OWN_VIEW_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000003';

const buildFlatViewField = ({
  id,
  applicationUniversalIdentifier = INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier,
  isSystemSideEffect = false,
}: {
  id: string;
  applicationUniversalIdentifier?: string;
  viewUniversalIdentifier: string;
  isSystemSideEffect?: boolean;
}) => ({
  id,
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
  isSystemSideEffect,
});

describe('findApplicationViewFieldIdsOnForeignViews', () => {
  it('returns the view fields an installed app created on views of other applications only', () => {
    expect(
      findApplicationViewFieldIdsOnForeignViews({
        flatViewFields: [
          buildFlatViewField({
            id: 'on-standard-view',
            viewUniversalIdentifier: STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          }),
          buildFlatViewField({
            id: 'on-other-application-view',
            viewUniversalIdentifier: OTHER_APPLICATION_VIEW_UNIVERSAL_IDENTIFIER,
          }),
          buildFlatViewField({
            id: 'on-own-view',
            viewUniversalIdentifier: OWN_VIEW_UNIVERSAL_IDENTIFIER,
          }),
          buildFlatViewField({
            id: 'engine-owned',
            viewUniversalIdentifier: STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: true,
          }),
          buildFlatViewField({
            id: 'user-owned',
            applicationUniversalIdentifier:
              WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          }),
          buildFlatViewField({
            id: 'on-missing-view',
            viewUniversalIdentifier: 'b1b2b3b4-b5b6-4000-8000-000000000009',
          }),
        ],
        flatViewByUniversalIdentifier: {
          [STANDARD_VIEW_UNIVERSAL_IDENTIFIER]: {
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
          [OTHER_APPLICATION_VIEW_UNIVERSAL_IDENTIFIER]: {
            applicationUniversalIdentifier:
              OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
          [OWN_VIEW_UNIVERSAL_IDENTIFIER]: {
            applicationUniversalIdentifier:
              INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        },
        engineOwnedApplicationUniversalIdentifiers: new Set([
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        ]),
      }),
    ).toEqual(['on-standard-view', 'on-other-application-view']);
  });
});
