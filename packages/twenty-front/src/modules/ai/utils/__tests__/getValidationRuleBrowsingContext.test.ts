import { getValidationRuleBrowsingContext } from '@/ai/utils/getValidationRuleBrowsingContext';

const OBJECT_METADATA_ITEMS = [
  {
    id: 'object-opportunity',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
  },
];

const getContext = (pathname: string) =>
  getValidationRuleBrowsingContext({
    pathname,
    objectMetadataItems: OBJECT_METADATA_ITEMS,
  });

describe('getValidationRuleBrowsingContext', () => {
  it('points to the rule being edited', () => {
    expect(
      getContext('/settings/objects/opportunities/validation-rules/rule-1'),
    ).toEqual({
      type: 'validationRule',
      objectMetadataId: 'object-opportunity',
      objectNameSingular: 'opportunity',
      validationRuleId: 'rule-1',
    });
  });

  it('points to the object when a new rule is being created', () => {
    expect(
      getContext('/settings/objects/opportunities/new-validation-rule'),
    ).toEqual({
      type: 'validationRule',
      objectMetadataId: 'object-opportunity',
      objectNameSingular: 'opportunity',
      validationRuleId: undefined,
    });
  });

  it('ignores other pages and unknown objects', () => {
    expect(getContext('/settings/objects/opportunities')).toBeNull();
    expect(getContext('/objects/opportunities')).toBeNull();
    expect(
      getContext('/settings/objects/unicorns/validation-rules/rule-1'),
    ).toBeNull();
  });
});
