type RequestInLayoutCustomizationModeArgs = {
  enterLayoutCustomizationMode: () => boolean;
  request: () => void;
};

export const requestInLayoutCustomizationMode = ({
  enterLayoutCustomizationMode,
  request,
}: RequestInLayoutCustomizationModeArgs) => {
  if (enterLayoutCustomizationMode()) {
    request();
  }
};
