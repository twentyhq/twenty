import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { formatToShortNumber, isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldCurrencyMetadata,
  type FieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { EllipsisDisplay } from '@/ui/field/display/components/internal/EllipsisDisplay/EllipsisDisplay';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledCurrencyIconContainer = styled.span`
  align-items: center;
  display: flex;
`;

type CurrencyDisplayProps = {
  currencyValue: FieldCurrencyValue | null | undefined;
  fieldDefinition: FieldDefinition<FieldCurrencyMetadata>;
};

export const CurrencyDisplay = ({
  currencyValue,
  fieldDefinition,
}: CurrencyDisplayProps) => {
  const theme = useTheme();
  const { i18n } = useLingui();

  const currencyCode = currencyValue?.currencyCode;
  const currencyMetadata = isDefined(currencyCode)
    ? SETTINGS_FIELD_CURRENCY_CODES[currencyCode]
    : null;
  const CurrencyIcon = currencyMetadata?.Icon ?? null;

  const amountToDisplay = isUndefinedOrNull(currencyValue?.amountMicros)
    ? null
    : currencyValue?.amountMicros / 1000000;

  const format = fieldDefinition.metadata.settings?.format;
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const decimalsToUse = decimals ?? DEFAULT_DECIMAL_VALUE;

  const { formatNumber } = useNumberFormat();
  const currencyLabel =
    isDefined(currencyCode) && isDefined(currencyMetadata)
      ? getCurrencyLabel({ currencyCode, locale: i18n.locale })
      : undefined;
  const currencyTooltipContent = isDefined(currencyCode)
    ? `${currencyCode}${isDefined(currencyLabel) ? ` - ${currencyLabel}` : ''}`
    : undefined;
  const shouldShowCurrencyTooltip =
    isDefined(CurrencyIcon) &&
    amountToDisplay !== null &&
    isDefined(currencyTooltipContent);

  return (
    <EllipsisDisplay>
      {shouldShowCurrencyTooltip && (
        <>
          <Tooltip
            content={currencyTooltipContent}
            delay={TooltipDelay.shortDelay}
            side="top"
            positionMethod="fixed"
          >
            <StyledCurrencyIconContainer>
              <CurrencyIcon
                color={theme.font.color.primary}
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </StyledCurrencyIconContainer>
          </Tooltip>{' '}
        </>
      )}
      {amountToDisplay !== null
        ? !isDefined(format) || format === 'short'
          ? formatToShortNumber(amountToDisplay)
          : formatNumber(amountToDisplay, { decimals: decimalsToUse })
        : null}
    </EllipsisDisplay>
  );
};
