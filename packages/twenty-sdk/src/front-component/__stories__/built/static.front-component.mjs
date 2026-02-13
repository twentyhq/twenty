var jsx = /* @__PURE__ */ (() => globalThis.jsx)();
var jsxs = /* @__PURE__ */ (() => globalThis.jsxs)();

var RemoteComponents = globalThis.RemoteComponents;
var StaticComponent = () => /* @__PURE__ */ jsxs(
  RemoteComponents.HtmlDiv,
  {
    "data-testid": "static-component",
    style: {
      padding: 20,
      backgroundColor: "#f0f4f8",
      borderRadius: 8,
      fontFamily: "system-ui, sans-serif"
    },
    children: [
      /* @__PURE__ */ jsx(RemoteComponents.HtmlH2, { style: { color: "#1a365d", fontWeight: 700, marginBottom: 12 }, children: "Static Component" }),
      /* @__PURE__ */ jsx(RemoteComponents.HtmlP, { style: { color: "#4a5568", fontSize: 14, lineHeight: 1.5 }, children: "This is a simple static component." }),
      /* @__PURE__ */ jsx(
        RemoteComponents.HtmlSpan,
        {
          "data-testid": "styled-badge",
          style: {
            display: "inline-block",
            padding: "4px 8px",
            backgroundColor: "#48bb78",
            color: "white",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600
          },
          children: "Styled Badge"
        }
      )
    ]
  }
);
var static_front_component_default = globalThis.jsx(StaticComponent, {});
export {
  static_front_component_default as default
};
