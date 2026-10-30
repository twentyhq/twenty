import { ACTOR_SOURCE_FILTER_OPTIONS } from '@/object-record/object-filter-dropdown/constants/ActorSourceFilterOptions';
import { getActorSourceFilterDisplayValue } from '@/object-record/object-filter-dropdown/utils/getActorSourceFilterDisplayValue';
import { getActorSourceMultiSelectOptions } from '@/object-record/object-filter-dropdown/utils/getActorSourceMultiSelectOptions';
import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

describe('getActorSourceFilterDisplayValue', () => {
  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should join up to three source names', () => {
    expect(getActorSourceFilterDisplayValue(['User', 'Api', 'Email'])).toBe(
      'User, Api, Email',
    );
  });

  it('should count the sources when there are more than three', () => {
    expect(
      getActorSourceFilterDisplayValue(['User', 'Api', 'Email', 'System']),
    ).toBe('4 source types');
  });

  it('should translate the option names but keep the English names to save', () => {
    const userOption = ACTOR_SOURCE_FILTER_OPTIONS.find(
      (actorSourceFilterOption) => actorSourceFilterOption.id === 'MANUAL',
    );

    i18n.load('fr-FR', { [userOption?.label.id ?? '']: 'Utilisateur' });
    i18n.activate('fr-FR');

    expect(
      getActorSourceMultiSelectOptions(['MANUAL']).find(
        (option) => option.id === 'MANUAL',
      ),
    ).toMatchObject({ name: 'Utilisateur', isSelected: true });
    expect(userOption?.name).toBe('User');
  });
});
