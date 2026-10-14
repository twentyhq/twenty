import { t } from '@lingui/core/macro';
import { css, cx } from '@linaria/core';
import { RATING_VALUES } from 'twenty-shared/constants';
import { type FieldRatingValue } from 'twenty-shared/types';
import { IconTwentyStarFilled } from 'twenty-ui/icon';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

const containerClassName = css`
  align-items: center;
  display: flex;
`;

const iconContainerClassName = css`
  color: ${themeCssVariables.background.quaternary};
  display: inline-flex;
`;

const activeIconContainerClassName = css`
  color: ${themeCssVariables.font.color.secondary};
`;

type RatingDisplayProps = {
  value: FieldRatingValue;
};

export const RatingDisplay = ({ value }: RatingDisplayProps) => {
  const selectedIndex = value !== null ? RATING_VALUES.indexOf(value) : -1;

  return (
    <div
      className={containerClassName}
      role="slider"
      aria-label={t`Rating`}
      aria-valuemax={RATING_VALUES.length}
      aria-valuemin={1}
      aria-valuenow={selectedIndex + 1}
      tabIndex={0}
    >
      {RATING_VALUES.map((ratingValue, index) => (
        <div
          key={ratingValue}
          className={cx(
            iconContainerClassName,
            index <= selectedIndex && activeIconContainerClassName,
          )}
        >
          <IconTwentyStarFilled size={THEME_COMMON.icon.size.md} />
        </div>
      ))}
    </div>
  );
};
