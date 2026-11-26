type RequestInLayoutCustomizationModeInput = {
  enterLayoutCustomizationMode: () => boolean;
  request: () => void;
};

export const requestInLayoutCustomizationMode = ({
  enterLayoutCustomizationMode,
  request,
}: RequestInLayoutCustomizationModeInput) => {
  if (enterLayoutCustomizationMode()) {
    request();
  }
};
