import { validateConditionalAvailabilityUsage } from '@/cli/utilities/build/manifest/utils/validate-conditional-availability-usage';

const validate = (source: string, filename = 'src/example.front-component.tsx') =>
  validateConditionalAvailabilityUsage(source, filename);

describe('validateConditionalAvailabilityUsage', () => {
  describe('valid usage', () => {
    it('should allow a variable inside a bare conditionalAvailabilityExpression', () => {
      const source = `
        import { defineCommandMenuItem } from 'twenty-sdk/define';
        import { objectMetadataItem } from 'twenty-sdk/define';

        export default defineCommandMenuItem({
          universalIdentifier: 'x',
          label: 'X',
          frontComponentUniversalIdentifier: 'y',
          conditionalAvailabilityExpression:
            objectMetadataItem.nameSingular === 'pullRequest',
        });
      `;

      expect(validate(source)).toEqual([]);
    });

    it('should allow a variable inside a nested command.conditionalAvailabilityExpression', () => {
      const source = `
        import { defineFrontComponent } from 'twenty-sdk/define';
        import { objectMetadataItem } from 'twenty-sdk/define';

        export default defineFrontComponent({
          universalIdentifier: 'x',
          component: () => null,
          command: {
            universalIdentifier: 'z',
            label: 'Z',
            conditionalAvailabilityExpression:
              objectMetadataItem.nameSingular === 'issue',
          },
        });
      `;

      expect(validate(source)).toEqual([]);
    });

    it('should allow operators inside the expression', () => {
      const source = `
        import { defineCommandMenuItem } from 'twenty-sdk/define';
        import { objectPermissions, everyEquals } from 'twenty-sdk/define';

        export default defineCommandMenuItem({
          conditionalAvailabilityExpression: everyEquals(
            objectPermissions,
            'canUpdateObjectRecords',
            true,
          ),
        });
      `;

      expect(validate(source)).toEqual([]);
    });

    it('should not flag same-named helpers imported from twenty-shared/utils', () => {
      const source = `
        import { isDefined } from 'twenty-shared/utils';

        export const useThing = (value: unknown) => {
          if (isDefined(value)) {
            return value;
          }

          return null;
        };
      `;

      expect(validate(source, 'src/use-thing.ts')).toEqual([]);
    });

    it('should not flag Array.prototype.includes property access', () => {
      const source = `
        import { includes } from 'twenty-sdk/define';
        import { defineCommandMenuItem } from 'twenty-sdk/define';

        const items: string[] = [];
        export const hasItem = items.includes('a');

        export default defineCommandMenuItem({
          conditionalAvailabilityExpression: includes(items, 'a'),
        });
      `;

      expect(validate(source, 'src/has-item.ts')).toEqual([]);
    });

    it('should trust files that define an expression (runtime placeholder is the backstop for in-file misuse)', () => {
      const source = `
        import { defineCommandMenuItem } from 'twenty-sdk/define';
        import { numberOfSelectedRecords } from 'twenty-sdk/define';

        export default defineCommandMenuItem({
          label: numberOfSelectedRecords,
          conditionalAvailabilityExpression: numberOfSelectedRecords >= 2,
        });
      `;

      expect(validate(source)).toEqual([]);
    });

    it('should trust an expression declared with a string-literal property key', () => {
      const source = `
        import { defineCommandMenuItem } from 'twenty-sdk/define';
        import { objectMetadataItem } from 'twenty-sdk/define';

        export default defineCommandMenuItem({
          'conditionalAvailabilityExpression':
            objectMetadataItem.nameSingular === 'pullRequest',
        });
      `;

      expect(validate(source)).toEqual([]);
    });

    it('should not flag a type-only import declaration', () => {
      const source = `
        import type { objectMetadataItem } from 'twenty-sdk/define';

        export type Thing = typeof objectMetadataItem;
      `;

      expect(validate(source, 'src/thing.ts')).toEqual([]);
    });

    it('should not flag an inline type-only import specifier', () => {
      const source = `
        import { type objectMetadataItem } from 'twenty-sdk/define';

        export type Thing = typeof objectMetadataItem;
      `;

      expect(validate(source, 'src/thing.ts')).toEqual([]);
    });
  });

  describe('invalid usage', () => {
    it('should flag a variable used in a component body', () => {
      const source = `
        import { objectMetadataItem } from 'twenty-sdk/define';

        export const Component = () => {
          const name = objectMetadataItem.nameSingular;
          return name;
        };
      `;

      const errors = validate(source);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('objectMetadataItem');
      expect(errors[0]).toContain('conditionalAvailabilityExpression');
    });

    it('should flag a variable imported in a file with no expression', () => {
      const source = `
        import { defineCommandMenuItem } from 'twenty-sdk/define';
        import { numberOfSelectedRecords } from 'twenty-sdk/define';

        export default defineCommandMenuItem({
          label: numberOfSelectedRecords,
        });
      `;

      const errors = validate(source);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('numberOfSelectedRecords');
    });

    it('should flag an operator called at runtime', () => {
      const source = `
        import { isDefined } from 'twenty-sdk/define';

        export const check = (value: unknown) => isDefined(value);
      `;

      const errors = validate(source, 'src/check.ts');

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('isDefined');
    });

    it('should flag a variable imported from the twenty-sdk root entry', () => {
      const source = `
        import { objectMetadataItem } from 'twenty-sdk';

        export const label = objectMetadataItem.labelSingular;
      `;

      expect(validate(source, 'src/label.ts')).toHaveLength(1);
    });

    it('should flag misuse when conditionalAvailabilityExpression appears only in a comment', () => {
      const source = `
        import { objectMetadataItem } from 'twenty-sdk/define';

        // TODO: move this into a conditionalAvailabilityExpression later
        export const Component = () => objectMetadataItem.nameSingular;
      `;

      const errors = validate(source);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('objectMetadataItem');
    });

    it('should flag misuse when conditionalAvailabilityExpression appears only in a string literal', () => {
      const source = `
        import { objectMetadataItem } from 'twenty-sdk/define';

        export const doc = 'conditionalAvailabilityExpression';
        export const Component = () => objectMetadataItem.nameSingular;
      `;

      const errors = validate(source);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('objectMetadataItem');
    });

    it('should flag namespace-import runtime use with no expression', () => {
      const source = `
        import * as sdk from 'twenty-sdk/define';

        export const label = sdk.objectMetadataItem.labelSingular;
      `;

      const errors = validate(source, 'src/label.ts');

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('objectMetadataItem');
    });
  });
});
