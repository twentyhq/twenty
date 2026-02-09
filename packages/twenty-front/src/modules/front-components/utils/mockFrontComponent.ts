import { isDefined } from 'twenty-shared/utils';

const mockFrontComponentCode = `
var navigate = /* @__PURE__ */ (() => globalThis.TwentySdk.navigate)();

var AppPath = /* @__PURE__ */ (() => globalThis.TwentyShared["types"].AppPath)();

var Button = /* @__PURE__ */ (() => globalThis.RemoteComponents.TwentyUiButton)();

var jsx = /* @__PURE__ */ (() => globalThis.jsx)();

var TestComponent = () => {
  return /* @__PURE__ */ jsx(
    Button,
    {
      title: "Navigate to people index page",
      onClick: () => navigate?.(AppPath.RecordIndexPage, {
        objectNamePlural: "people"
      })
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
