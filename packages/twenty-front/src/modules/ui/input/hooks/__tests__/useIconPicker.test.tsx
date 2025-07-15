import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { useIconPicker } from '@/ui/input/hooks/useIconPicker';
import { Icon123, IconApps } from 'twenty-ui/display';

describe('useIconPicker', () => {
  it('should return correct iconPickerState', async () => {
    const { result } = renderHook(() => useIconPicker(), {
      wrapper: RecoilRoot,
    });

    const { Icon, iconKey, setIconPicker } = result.current;

    expect(Icon).toEqual(IconApps);
    expect(iconKey).toEqual('IconApps');
    expect(setIconPicker).toBeInstanceOf(Function);
  });

  it('should update the icon', async () => {
    const { result } = renderHook(() => useIconPicker(), {
      wrapper: RecoilRoot,
    });

    const { Icon, iconKey, setIconPicker } = result.current;

    expect(Icon).toEqual(IconApps);
    expect(iconKey).toEqual('IconApps');
    expect(setIconPicker).toBeInstanceOf(Function);

    await act(async () => {
      result.current.setIconPicker({ Icon: Icon123, iconKey: 'Icon123' });
    });

    const { Icon: UpdatedIcon, iconKey: updatedIconKey } = result.current;

    expect(UpdatedIcon).toEqual(Icon123);
    expect(updatedIconKey).toEqual('Icon123');
  });
});
