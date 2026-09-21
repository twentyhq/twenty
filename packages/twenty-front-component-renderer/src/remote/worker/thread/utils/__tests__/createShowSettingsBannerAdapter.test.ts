import { createHideSettingsBannerAdapter } from '../createHideSettingsBannerAdapter';
import { createShowSettingsBannerAdapter } from '../createShowSettingsBannerAdapter';
import { handleSettingsBannerActionClick } from '../handleSettingsBannerActionClick';

describe('createShowSettingsBannerAdapter', () => {
  it('should forward only the serializable banner to the host', async () => {
    const showSettingsBanner = jest.fn(async () => {});

    await createShowSettingsBannerAdapter({ showSettingsBanner })({
      variant: 'warning',
      text: 'Missing configuration',
      action: { label: 'Configure', onClick: jest.fn() },
    });

    expect(showSettingsBanner).toHaveBeenCalledWith({
      variant: 'warning',
      text: 'Missing configuration',
      action: { label: 'Configure' },
    });
  });

  it('should call the registered action callback on click', async () => {
    const onClick = jest.fn();

    await createShowSettingsBannerAdapter({
      showSettingsBanner: jest.fn(async () => {}),
    })({
      text: 'Missing configuration',
      action: { label: 'Configure', onClick },
    });

    await handleSettingsBannerActionClick();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should drop the action callback once the banner is hidden', async () => {
    const onClick = jest.fn();

    await createShowSettingsBannerAdapter({
      showSettingsBanner: jest.fn(async () => {}),
    })({
      text: 'Missing configuration',
      action: { label: 'Configure', onClick },
    });

    await createHideSettingsBannerAdapter({
      hideSettingsBanner: jest.fn(async () => {}),
    })();

    await handleSettingsBannerActionClick();

    expect(onClick).not.toHaveBeenCalled();
  });
});
