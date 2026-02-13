var useState = /* @__PURE__ */ (() => globalThis.React.useState)();

var jsx = /* @__PURE__ */ (() => globalThis.jsx)();
var jsxs = /* @__PURE__ */ (() => globalThis.jsxs)();

var RemoteComponents = globalThis.RemoteComponents;
var InteractiveComponent = () => {
  const [count, setCount] = useState(0);
  return /* @__PURE__ */ jsxs(
    RemoteComponents.HtmlDiv,
    {
      "data-testid": "interactive-component",
      style: {
        padding: 24,
        backgroundColor: "#faf5ff",
        border: "2px solid #9f7aea",
        borderRadius: 12
      },
      children: [
        /* @__PURE__ */ jsx(
          RemoteComponents.HtmlH2,
          {
            style: {
              color: "#553c9a",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16
            },
            children: "Interactive Component"
          }
        ),
        /* @__PURE__ */ jsxs(
          RemoteComponents.HtmlP,
          {
            "data-testid": "count-display",
            style: {
              fontSize: 32,
              fontWeight: 800,
              color: "#6b46c1",
              marginBottom: 16
            },
            children: [
              "Count: ",
              count
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          RemoteComponents.HtmlButton,
          {
            "data-testid": "increment-button",
            onClick: () => setCount((c) => c + 1),
            style: {
              padding: "10px 20px",
              backgroundColor: "#805ad5",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer"
            },
            children: "Increment"
          }
        )
      ]
    }
  );
};
var interactive_front_component_default = globalThis.jsx(InteractiveComponent, {});
export {
  interactive_front_component_default as default
};
