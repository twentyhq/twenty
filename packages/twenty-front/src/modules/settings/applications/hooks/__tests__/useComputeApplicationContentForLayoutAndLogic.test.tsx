import { renderHook } from '@testing-library/react';

import { useComputeApplicationContentForLayoutAndLogic } from '@/settings/applications/hooks/useComputeApplicationContentForLayoutAndLogic';
import { type Manifest } from 'twenty-shared/application';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockObjectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObject = mockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const APP_ID = 'test-app-id';

const wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const baseManifest = {
  pageLayouts: [],
  views: [],
  navigationMenuItems: [],
  agents: [],
  skills: [],
  roles: [],
} as unknown as Manifest;

describe('useComputeApplicationContentForLayoutAndLogic', () => {
  describe('pageLayoutRows', () => {
    it('builds rows from manifest pageLayouts and resolves the object label from workspace metadata', () => {
      const manifestContent = {
        ...baseManifest,
        objects: [],
        pageLayouts: [
          {
            universalIdentifier: 'pl-1',
            name: 'Person dashboard',
            objectUniversalIdentifier: personObject.universalIdentifier,
            tabs: [
              { universalIdentifier: 't1' },
              { universalIdentifier: 't2' },
            ],
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({ manifestContent }),
        { wrapper },
      );

      expect(result.current.pageLayoutRows).toHaveLength(1);
      const [row] = result.current.pageLayoutRows;
      expect(row.key).toBe('pl-1');
      expect(row.name).toBe('Person dashboard');
      expect(row.secondary).toContain(personObject.labelSingular);
      expect(row.secondary).toContain('2 tabs');
      expect(row.link).toBeUndefined();
    });

    it('exposes a link to the layout detail page when an installed app is provided', () => {
      const manifestContent = {
        ...baseManifest,
        objects: [],
        pageLayouts: [
          {
            universalIdentifier: 'pl-1',
            name: 'Layout',
            tabs: [],
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({
            installedApplication: { id: APP_ID, agents: [] },
            manifestContent,
          }),
        { wrapper },
      );

      expect(result.current.pageLayoutRows[0].link).toBeDefined();
    });
  });

  describe('viewRows', () => {
    it('builds rows from manifest views with type/object secondary', () => {
      const manifestContent = {
        ...baseManifest,
        objects: [],
        views: [
          {
            universalIdentifier: 'v-1',
            name: 'My table',
            type: 'TABLE',
            objectUniversalIdentifier: personObject.universalIdentifier,
            icon: 'IconTable',
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({ manifestContent }),
        { wrapper },
      );

      const [row] = result.current.viewRows;
      expect(row.icon).toBe('IconTable');
      expect(row.secondary).toContain('Table');
      expect(row.secondary).toContain(personObject.labelSingular);
    });
  });

  describe('navigationMenuItemRows', () => {
    it('falls back to a destination-derived display name when the item has no name', () => {
      const manifestContent = {
        ...baseManifest,
        objects: [],
        navigationMenuItems: [
          {
            universalIdentifier: 'n-1',
            type: 'OBJECT',
            targetObjectUniversalIdentifier: personObject.universalIdentifier,
          },
          { universalIdentifier: 'n-2', type: 'FOLDER' },
          {
            universalIdentifier: 'n-3',
            type: 'LINK',
            link: 'https://example.com',
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({ manifestContent }),
        { wrapper },
      );

      expect(result.current.navigationMenuItemRows[0].name).toBe(
        personObject.labelSingular,
      );
      expect(result.current.navigationMenuItemRows[1].name).toBe('Folder');
      expect(result.current.navigationMenuItemRows[2].name).toBe(
        'https://example.com',
      );
    });

    it('resolves PAGE_LAYOUT and VIEW destinations against the manifest', () => {
      const manifestContent = {
        ...baseManifest,
        objects: [],
        pageLayouts: [{ universalIdentifier: 'pl-1', name: 'Layout A' }],
        views: [{ universalIdentifier: 'v-1', name: 'View A' }],
        navigationMenuItems: [
          {
            universalIdentifier: 'n-1',
            type: 'PAGE_LAYOUT',
            pageLayoutUniversalIdentifier: 'pl-1',
          },
          {
            universalIdentifier: 'n-2',
            type: 'VIEW',
            viewUniversalIdentifier: 'v-1',
          },
        ],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({ manifestContent }),
        { wrapper },
      );

      expect(result.current.navigationMenuItemRows[0].secondary).toContain(
        'Layout A',
      );
      expect(result.current.navigationMenuItemRows[1].secondary).toContain(
        'View A',
      );
    });
  });

  describe('agentRows', () => {
    it('uses installed agents (with link) when available, manifest agents otherwise', () => {
      const installed = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({
            installedApplication: {
              id: APP_ID,
              agents: [
                {
                  id: 'agent-1',
                  label: 'Workspace Agent',
                  description: 'desc',
                },
              ],
            } as never,
            manifestContent: baseManifest,
          }),
        { wrapper },
      );
      expect(installed.result.current.agentRows[0].key).toBe('agent-1');
      expect(installed.result.current.agentRows[0].link).toBeDefined();

      const marketplace = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({
            manifestContent: {
              ...baseManifest,
              agents: [
                { universalIdentifier: 'a-uid', label: 'Manifest Agent' },
              ],
            } as unknown as Manifest,
          }),
        { wrapper },
      );
      expect(marketplace.result.current.agentRows[0].key).toBe('a-uid');
      expect(marketplace.result.current.agentRows[0].link).toBeUndefined();
    });
  });

  describe('skillRows and roleRows', () => {
    it('builds rows from manifest skills and roles', () => {
      const manifestContent = {
        ...baseManifest,
        skills: [{ universalIdentifier: 's-1', label: 'Skill A' }],
        roles: [{ universalIdentifier: 'r-1', label: 'Role A' }],
      } as unknown as Manifest;

      const { result } = renderHook(
        () =>
          useComputeApplicationContentForLayoutAndLogic({ manifestContent }),
        { wrapper },
      );

      expect(result.current.skillRows[0].name).toBe('Skill A');
      expect(result.current.roleRows[0].name).toBe('Role A');
    });
  });
});
