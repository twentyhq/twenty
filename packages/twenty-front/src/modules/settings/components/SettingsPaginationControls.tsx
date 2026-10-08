import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsPaginationControlsProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsPaginationControls = ({
  page,
  pageCount,
  onPageChange,
  isLoading = false,
  hasNextPage,
}: SettingsPaginationControlsProps) => {
  const { t } = useLingui();

  const isNextDisabled = isDefined(hasNextPage)
    ? !hasNextPage
    : page + 1 >= pageCount;

  return (
    <StyledContainer>
      <Button
        size="sm"
        disabled={page === 0 || isLoading}
        onClick={() => onPageChange(page - 1)}
        variant="outline"
      >{t`Previous`}</Button>
      <div>{t`Page ${page + 1} of ${pageCount}`}</div>
      <Button
        size="sm"
        disabled={isNextDisabled || isLoading}
        onClick={() => onPageChange(page + 1)}
        variant="outline"
      >{t`Next`}</Button>
    </StyledContainer>
  );
};
