import { getSubMenuOptions } from '../getSubMenuOptions';

describe('getSubMenuOptions', () => {
  describe('ACTOR field type', () => {
    it('should return three options for ACTOR submenu', () => {
      const options = getSubMenuOptions('ACTOR');

      expect(options).toHaveLength(3);
    });

    it('should include Creation Source option', () => {
      const options = getSubMenuOptions('ACTOR');

      const sourceOption = options.find((opt) => opt.type === 'SOURCE');
      expect(sourceOption).toBeDefined();
      expect(sourceOption?.name).toBe('Creation Source');
      expect(sourceOption?.icon).toBe('IconPlug');
    });

    it('should include Creator Name option', () => {
      const options = getSubMenuOptions('ACTOR');

      const nameOption = options.find(
        (opt) => opt.type === 'ACTOR' && opt.name === 'Creator Name',
      );
      expect(nameOption).toBeDefined();
      expect(nameOption?.icon).toBe('IconId');
    });

    it('should include Workspace Member option', () => {
      const options = getSubMenuOptions('ACTOR');

      const workspaceMemberOption = options.find(
        (opt) => opt.type === 'WORKSPACE_MEMBER',
      );
      expect(workspaceMemberOption).toBeDefined();
      expect(workspaceMemberOption?.name).toBe('Workspace Member');
      expect(workspaceMemberOption?.icon).toBe('IconUser');
    });

    it('should return options in correct order: Source, Name, Workspace Member', () => {
      const options = getSubMenuOptions('ACTOR');

      expect(options[0].type).toBe('SOURCE');
      expect(options[1].type).toBe('ACTOR');
      expect(options[2].type).toBe('WORKSPACE_MEMBER');
    });
  });

  describe('non-ACTOR field types', () => {
    it('should return empty array for null', () => {
      const options = getSubMenuOptions(null);

      expect(options).toEqual([]);
    });

    it('should return empty array for TEXT field type', () => {
      const options = getSubMenuOptions('TEXT');

      expect(options).toEqual([]);
    });

    it('should return empty array for RELATION field type', () => {
      const options = getSubMenuOptions('RELATION');

      expect(options).toEqual([]);
    });

    it('should return empty array for SELECT field type', () => {
      const options = getSubMenuOptions('SELECT');

      expect(options).toEqual([]);
    });
  });
});

