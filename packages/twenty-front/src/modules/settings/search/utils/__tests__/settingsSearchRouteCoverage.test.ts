import { createSettingsRouteObjects } from '@/app/components/SettingsRoutes';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { SETTINGS_SEARCH_OBJECT_LABEL_TITLE } from '@/settings/search/constants/SettingsSearchObjectLabelTitle';
import { type SettingsSearchRouteHandle } from '@/settings/search/types/SettingsSearchRouteHandle';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const getRoutesWithPath = (
  routeObjects: WorkspaceRouteObject[],
): WorkspaceRouteObject[] =>
  routeObjects.flatMap((routeObject) => [
    ...(isDefined(routeObject.path) ? [routeObject] : []),
    ...getRoutesWithPath(routeObject.children ?? []),
  ]);

const getSettingsSearch = (handle: SettingsSearchRouteHandle | undefined) =>
  handle?.settingsSearch;

const ROUTES = getRoutesWithPath(
  createSettingsRouteObjects({ isAdminPageEnabled: true }),
);

const SEARCHABLE_ROUTES = ROUTES.flatMap(({ path, handle }) => {
  const settingsSearch = getSettingsSearch(handle);

  return isDefined(settingsSearch) && settingsSearch !== false
    ? [{ path, settingsSearch }]
    : [];
});

describe('settings search route coverage', () => {
  it('makes every static settings route searchable or explicitly excluded', () => {
    const undeclaredPaths = ROUTES.filter(
      ({ path, handle }) =>
        !path?.includes(':') && getSettingsSearch(handle) === undefined,
    ).map(({ path }) => path);

    expect(undeclaredPaths).toEqual([]);
  });

  it('declares search metadata only on settings paths', () => {
    const settingsPaths: string[] = Object.values(SettingsPath);

    expect(
      SEARCHABLE_ROUTES.map(({ path }) => path).filter(
        (path) => !settingsPaths.includes(path ?? ''),
      ),
    ).toEqual([]);
  });

  it('points every parent at a searchable route', () => {
    const searchablePaths = SEARCHABLE_ROUTES.map(({ path }) => path);

    expect(
      SEARCHABLE_ROUTES.flatMap(({ settingsSearch }) =>
        'parentPath' in settingsSearch ? [settingsSearch.parentPath] : [],
      ).filter((parentPath) => !searchablePaths.includes(parentPath)),
    ).toEqual([]);
  });

  it('expands per object only routes keyed by the object name alone', () => {
    const expandedRoutes = SEARCHABLE_ROUTES.filter(
      ({ settingsSearch }) => settingsSearch.isExpandedPerObject === true,
    );
    const expandedPaths = expandedRoutes.map(({ path }) => path);

    expect(
      expandedRoutes.filter(
        ({ path }) =>
          !isDeeplyEqual(path?.match(/:\w+/g) ?? [], [':objectNamePlural']),
      ),
    ).toEqual([]);
    expect(
      SEARCHABLE_ROUTES.filter(
        ({ settingsSearch }) =>
          settingsSearch.isExpandedPerObject !== true &&
          (settingsSearch.title === SETTINGS_SEARCH_OBJECT_LABEL_TITLE ||
            ('parentPath' in settingsSearch &&
              expandedPaths.includes(settingsSearch.parentPath))),
      ).map(({ path }) => path),
    ).toEqual([]);
  });
});
