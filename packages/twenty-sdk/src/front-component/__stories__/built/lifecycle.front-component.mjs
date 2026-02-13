var useEffect = /* @__PURE__ */ (() => globalThis.React.useEffect)();
var useState = /* @__PURE__ */ (() => globalThis.React.useState)();

var jsx = /* @__PURE__ */ (() => globalThis.jsx)();
var jsxs = /* @__PURE__ */ (() => globalThis.jsxs)();

var RemoteComponents = globalThis.RemoteComponents;
var LifecycleComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxs(
    RemoteComponents.HtmlDiv,
    {
      "data-testid": "lifecycle-component",
      style: {
        padding: 20,
        backgroundColor: "#fffaf0",
        borderLeft: "4px solid #ed8936",
        borderRadius: "0 8px 8px 0"
      },
      children: [
        /* @__PURE__ */ jsx(
          RemoteComponents.HtmlH2,
          {
            style: {
              color: "#c05621",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16
            },
            children: "Lifecycle Component"
          }
        ),
        /* @__PURE__ */ jsxs(RemoteComponents.HtmlDiv, { style: { display: "flex", gap: 12, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx(
            RemoteComponents.HtmlP,
            {
              "data-testid": "mounted-status",
              style: {
                padding: "8px 16px",
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 14,
                backgroundColor: mounted ? "#c6f6d5" : "#fed7d7",
                color: mounted ? "#276749" : "#c53030"
              },
              children: mounted ? "Mounted" : "Not mounted"
            }
          ),
          /* @__PURE__ */ jsxs(
            RemoteComponents.HtmlP,
            {
              "data-testid": "tick-count",
              style: {
                padding: "8px 16px",
                backgroundColor: "#bee3f8",
                color: "#2b6cb0",
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 14
              },
              children: [
                "Ticks: ",
                ticks
              ]
            }
          )
        ] })
      ]
    }
  );
};
var lifecycle_front_component_default = globalThis.jsx(LifecycleComponent, {});
export {
  lifecycle_front_component_default as default
};
