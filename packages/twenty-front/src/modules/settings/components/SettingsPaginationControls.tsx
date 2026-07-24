import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
        title={t`Previous`}
        variant="secondary"
        size="small"
        disabled={page === 0 || isLoading}
        onClick={() => onPageChange(page - 1)}
      />
      <div>
        {t`Page`} {page + 1} {t`of`} {pageCount}
      </div>
      <Button
        title={t`Next`}
        variant="secondary"
        size="small"
        disabled={isNextDisabled || isLoading}
        onClick={() => onPageChange(page + 1)}
      />
    </StyledContainer>
  );
};
