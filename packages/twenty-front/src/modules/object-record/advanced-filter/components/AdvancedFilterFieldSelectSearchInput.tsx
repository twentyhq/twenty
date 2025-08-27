import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-top: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  min-height: 19px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const AdvancedFilterFieldSelectSearchInput = () => {
  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useRecoilComponentState(objectFilterDropdownSearchInputComponentState);

  return (
    <StyledInput
      value={objectFilterDropdownSearchInput}
      autoFocus
      placeholder={t`Search fields`}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setObjectFilterDropdownSearchInput(event.target.value)
      }
    />
  );
};
