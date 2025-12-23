import { isLocationMatchingFavorite } from '@/favorites/utils/isLocationMatchingFavorite';

describe('isLocationMatchingFavorite', () => {
  it('should return true if favorite link matches current path', () => {
    const currentPath = '/app/objects/people';
    const currentViewPath = '/app/objects/people?viewId=123';
    const favorite = {
      objectNameSingular: 'object',
      link: '/app/objects/people',
    };

    expect(
      isLocationMatchingFavorite(currentPath, currentViewPath, favorite),
    ).toBe(true);
  });

  it('should return true if favorite link matches current view path', () => {
    const currentPath = '/app/object/company/12';
    const currentViewPath = '/app/object/company/12?viewId=123';
    const favorite = {
      objectNameSingular: 'company',
      link: '/app/object/company/12',
    };

    expect(
      isLocationMatchingFavorite(currentPath, currentViewPath, favorite),
    ).toBe(true);
  });

  it('should return false if favorite link does not match current path', () => {
    const currentPath = '/app/objects/people';
    const currentViewPath = '/app/objects/people?viewId=123';
    const favorite = {
      objectNameSingular: 'object',
      link: '/app/objects/company',
    };

    expect(
      isLocationMatchingFavorite(currentPath, currentViewPath, favorite),
    ).toBe(false);
  });

  it('should return false if favorite link does not match current view path', () => {
    const currentPath = '/app/objects/companies';
    const currentViewPath = '/app/objects/companies?viewId=123';
    const favorite = {
      objectNameSingular: 'view',
      link: '/app/objects/companies?viewId=246',
    };

    expect(
      isLocationMatchingFavorite(currentPath, currentViewPath, favorite),
    ).toBe(false);
  });
});
