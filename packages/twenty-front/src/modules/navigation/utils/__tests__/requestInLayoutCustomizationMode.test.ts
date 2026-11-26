import { requestInLayoutCustomizationMode } from '@/navigation/utils/requestInLayoutCustomizationMode';

describe('requestInLayoutCustomizationMode', () => {
  it('makes the request once customization mode is entered', () => {
    const request = jest.fn();

    requestInLayoutCustomizationMode({
      enterLayoutCustomizationMode: () => true,
      request,
    });

    expect(request).toHaveBeenCalledTimes(1);
  });

  it('drops the request when customization mode is refused', () => {
    const request = jest.fn();

    requestInLayoutCustomizationMode({
      enterLayoutCustomizationMode: () => false,
      request,
    });

    expect(request).not.toHaveBeenCalled();
  });
});
