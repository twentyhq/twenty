"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    rules: {
        "effect-components": require("./src/rules/effect-components"),
        "no-hardcoded-colors": require("./src/rules/no-hardcoded-colors"),
        "no-spread-props": require('./src/rules/no-spread-props'),
        "matching-state-variable": require("./src/rules/matching-state-variable"),
        "sort-css-properties-alphabetically": require("./src/rules/sort-css-properties-alphabetically"),
        "styled-components-prefixed-with-styled": require("./src/rules/styled-components-prefixed-with-styled"),
    },
};
