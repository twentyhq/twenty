import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/icon';

import { useLogConsoleSources } from '@/log-console/hooks/useLogConsoleSources';
import { Select } from '@/ui/input/components/Select';

const LOG_CONSOLE_SOURCE_SELECT_DROPDOWN_ID = 'log-console-source-select';

const StyledContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const LogConsoleSourceSelect = () => {
  const { t } = useLingui();
  const { sources, activeSource, isSourceLocked, changeSource } =
    useLogConsoleSources();

  return (
    <StyledContainer>
      <Select
        dropdownId={LOG_CONSOLE_SOURCE_SELECT_DROPDOWN_ID}
        fullWidth
        needIconCheck
        value={activeSource.id}
        options={sources.map((source) => ({
          value: source.id,
          label: t(source.label),
          Icon: isSourceLocked(source) ? IconLock : source.Icon,
        }))}
        onChange={changeSource}
      />
    </StyledContainer>
  );
};
