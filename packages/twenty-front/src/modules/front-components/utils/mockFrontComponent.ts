import { isDefined } from 'twenty-shared/utils';

const mockFrontComponentCode = `
// react-globals:react/jsx-runtime
var jsx = globalThis.jsx;

// src/test-component.front-component.tsx
var RemoteComponents = globalThis.RemoteComponents;

var TestComponent = () => {
  return /* @__PURE__ */ jsx(
    RemoteComponents.TwentyUiButton,
    {
      title: "Click me",
      onClick: (event) => {
        console.log("click event:", event);
      }
    }
  );
};

var test_component_front_component_default = globalThis.jsx(TestComponent, {});
export {
  test_component_front_component_default as default
};
`;

let cachedMockBlobUrl: string | null = null;

export const getMockFrontComponentUrl = (): string => {
  if (isDefined(cachedMockBlobUrl)) {
    return cachedMockBlobUrl;
  }

  const blob = new Blob([mockFrontComponentCode], {
    type: 'application/javascript',
  });
  cachedMockBlobUrl = URL.createObjectURL(blob);

  return cachedMockBlobUrl;
};
