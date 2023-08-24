import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

export function BoardOptionsDropdownButton() {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    key: 'options',
  });

  function handleClick() {
    toggleDropdownButton();
  }

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={handleClick}
    >
      Options
    </StyledHeaderDropdownButton>
  );
}
