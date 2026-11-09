import { t } from '@lingui/core/macro';

import { DASHBOARD_FILTER_DEFAULT_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterDefaultOptionValue';
import { DASHBOARD_FILTER_IGNORED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterIgnoredOptionValue';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterWidgetSetting } from '@/page-layout/types/DashboardFilterWidgetSetting';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import {
  type getDashboardFilterCandidateFieldMetadataIds,
  isDefined,
  isFieldBindableToDashboardFilter,
  resolveDashboardFilterFieldForWidget,
} from 'twenty-shared/utils';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export const getDashboardFilterWidgetSetting = ({
  pageLayoutFilter,
  bindings,
  candidateFieldMetadataIds,
  fields,
}: {
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'type'>;
  bindings: DashboardFilterBinding[];
  candidateFieldMetadataIds: ReturnType<
    typeof getDashboardFilterCandidateFieldMetadataIds
  >;
  fields: DashboardFilterWidgetField[];
}): DashboardFilterWidgetSetting => {
  const resolve = (bindingsToResolve: DashboardFilterBinding[]) =>
    resolveDashboardFilterFieldForWidget({
      pageLayoutFilterId: pageLayoutFilter.id,
      filterType: pageLayoutFilter.type,
      bindings: bindingsToResolve,
      ...candidateFieldMetadataIds,
      fields,
    });

  const binding = bindings.find(
    ({ pageLayoutFilterId }) => pageLayoutFilterId === pageLayoutFilter.id,
  );

  const resolution = resolve(bindings);
  const defaultResolution = isDefined(binding) ? resolve([]) : resolution;

  const defaultField = fields.find(
    ({ id }) => id === defaultResolution.fieldMetadataId,
  );

  const defaultFieldLabel = defaultField?.label;
  const overrideFieldMetadataId = binding?.fieldMetadataId ?? null;

  // The resolver turns an override to a missing or unbindable field into UNRESOLVED
  const unavailableOverrideOptions =
    isDefined(overrideFieldMetadataId) && resolution.source === 'UNRESOLVED'
      ? [
          {
            value: overrideFieldMetadataId,
            label: t`Unavailable field`,
            iconName: 'IconFilterOff',
          },
        ]
      : [];

  // A deactivated override keeps applying, so it stays selectable
  const fieldOptions = fields
    .filter(
      (field) =>
        (field.id === overrideFieldMetadataId &&
          unavailableOverrideOptions.length === 0) ||
        ((field.isActive ?? false) &&
          isFieldBindableToDashboardFilter({
            field,
            filterType: pageLayoutFilter.type,
          })),
    )
    .map(({ id, label, icon }) => ({ value: id, label, iconName: icon }));

  return {
    resolution,
    value:
      overrideFieldMetadataId ??
      (isDefined(binding)
        ? DASHBOARD_FILTER_IGNORED_OPTION_VALUE
        : DASHBOARD_FILTER_DEFAULT_OPTION_VALUE),
    options: [
      {
        value: DASHBOARD_FILTER_DEFAULT_OPTION_VALUE,
        label: isDefined(defaultFieldLabel)
          ? t`Default (${defaultFieldLabel})`
          : t`Default (no date field)`,
        iconName: defaultField?.icon ?? 'IconFilterOff',
      },
      ...unavailableOverrideOptions,
      ...fieldOptions,
      {
        value: DASHBOARD_FILTER_IGNORED_OPTION_VALUE,
        label: t`Ignored`,
        iconName: 'IconFilterOff',
      },
    ],
  };
};
