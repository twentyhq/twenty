/* eslint-disable */
import { isDefined } from 'twenty-shared/utils';

const mockFrontComponentCode = `
// react-globals:react
var useState = globalThis.React.useState;
var useEffect = globalThis.React.useEffect;
var useSyncExternalStore = globalThis.React.useSyncExternalStore;

// react-globals:react/jsx-runtime
var jsx = globalThis.jsx;
var jsxs = globalThis.jsxs;
var Fragment = globalThis.React.Fragment;

// src/tata/test-component.front-component.tsx
var RemoteComponents = globalThis.RemoteComponents;
var getStore = () => {
  const store = globalThis.frontComponentExecutionContextStore;
  if (store === void 0) {
    throw new Error(
      "frontComponentExecutionContextStore not found on globalThis. This hook must be used within a front component running in the worker."
    );
  }
  return store;
};
var useFrontComponentExecutionContext = () => {
  const store = getStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
};
var TestComponent = () => {
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const context = useFrontComponentExecutionContext();
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxs(
    RemoteComponents.HtmlDiv,
    {
      style: {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      },
      children: [
        /* @__PURE__ */ jsx(RemoteComponents.HtmlH1, { style: { color: "#333", marginBottom: "20px", fontSize: "24px" }, children: "Test Component" }),
        /* @__PURE__ */ jsxs(RemoteComponents.HtmlP, { style: { fontSize: "18px", marginBottom: "10px", color: "#666" }, children: [
          "Count: ",
          count
        ] }),
        /* @__PURE__ */ jsxs(RemoteComponents.HtmlP, { style: { fontSize: "18px", marginBottom: "20px", color: "#666" }, children: [
          "Timer: ",
          timer,
          "s"
        ] }),
        /* @__PURE__ */ jsxs(RemoteComponents.HtmlP, { style: { fontSize: "18px", marginBottom: "20px", color: "#666" }, children: [
          "User ID: ",
          context?.userId
        ] }),
        /* @__PURE__ */ jsx(
          RemoteComponents.HtmlButton,
          {
            onClick: () => setCount(count + 1),
            style: {
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = "#0056b3";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = "#007bff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
            },
            children: "Increment"
          }
        )
      ]
    }
  );
};
var test_component_front_component_default = globalThis.jsx(TestComponent, {});
export {
  test_component_front_component_default as default,
  useFrontComponentExecutionContext
};
//# sourceMappingURL=test-component.front-component.mjs.map
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
