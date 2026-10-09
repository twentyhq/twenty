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
import { CURRENCY_CODE_LABELS } from 'twenty-shared/constants';
import { CURRENCY_CODE_ICONS } from '@/ui/input/components/internal/currency/constants/CurrencyCodeIcons';
import { EllipsisDisplay } from '@/ui/field/display/components/internal/EllipsisDisplay/EllipsisDisplay';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { DEFAULT_DECIMAL_VALUE } from '@/localization/utils/formatNumber';

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
  const CurrencyIcon = isDefined(currencyCode)
    ? CURRENCY_CODE_ICONS[currencyCode]
    : null;
  const currencyLabel = isDefined(currencyCode)
    ? CURRENCY_CODE_LABELS[currencyCode]?.label
    : undefined;

  const amountToDisplay = !isDefined(currencyValue?.amountMicros)
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
