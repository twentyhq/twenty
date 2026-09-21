import { buildManifestEntityLabelByUniversalIdentifier } from '@/cli/utilities/pull/build-manifest-entity-label-by-universal-identifier';
import { type Manifest } from 'twenty-shared/application';
import { describe, expect, it } from 'vitest';

const buildManifest = (overrides: Record<string, unknown>): Manifest =>
  overrides as unknown as Manifest;

describe('buildManifestEntityLabelByUniversalIdentifier', () => {
  it('should qualify a nested entity with the labels of its parents', () => {
    expect(
      buildManifestEntityLabelByUniversalIdentifier(
        buildManifest({
          objects: [
            {
              universalIdentifier: 'ticket-identifier',
              nameSingular: 'ticket',
              namePlural: 'tickets',
              fields: [
                { universalIdentifier: 'labels-identifier', name: 'labels' },
              ],
            },
          ],
          pageLayouts: [
            {
              universalIdentifier: 'layout-identifier',
              name: 'Dashboard',
              tabs: [
                {
                  universalIdentifier: 'tab-identifier',
                  title: 'Overview',
                  widgets: [
                    {
                      universalIdentifier: 'widget-identifier',
                      title: 'Runbook',
                    },
                  ],
                },
              ],
            },
          ],
          roles: [
            { universalIdentifier: 'role-identifier', label: 'Recruiter' },
          ],
        }),
      ),
    ).toEqual({
      'ticket-identifier': 'ticket',
      'labels-identifier': 'ticket.labels',
      'layout-identifier': 'Dashboard',
      'tab-identifier': 'Dashboard.Overview',
      'widget-identifier': 'Dashboard.Overview.Runbook',
      'role-identifier': 'Recruiter',
    });
  });

  it('should leave out an entity that carries no label of its own', () => {
    expect(
      buildManifestEntityLabelByUniversalIdentifier(
        buildManifest({
          application: {
            universalIdentifier: 'application-identifier',
            displayName: 'Custom',
          },
          views: [
            {
              universalIdentifier: 'view-identifier',
              name: 'Open tickets',
              fields: [
                {
                  universalIdentifier: 'view-field-identifier',
                  fieldMetadataUniversalIdentifier: 'labels-identifier',
                },
              ],
            },
          ],
        }),
      ),
    ).toEqual({ 'view-identifier': 'Open tickets' });
  });

  it('should never register the labelled entries of a JSON value', () => {
    expect(
      buildManifestEntityLabelByUniversalIdentifier(
        buildManifest({
          fields: [
            {
              universalIdentifier: 'priority-identifier',
              name: 'priority',
              options: [{ id: 'option-id', label: 'High', value: 'HIGH' }],
              defaultValue: { name: 'ignored' },
            },
          ],
        }),
      ),
    ).toEqual({ 'priority-identifier': 'priority' });
  });
});
