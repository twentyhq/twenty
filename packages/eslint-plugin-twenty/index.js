// eslint-disable-next-line @typescript-eslint/no-var-requires
const noHardcodedColors = require("./rules/no-hardcoded-colors");
const cssAlphabetically = require("./rules/sort-css-properties-alphabetically");
const styledComponentsPrefixedWithStyled = require("./rules/styled-components-prefixed-with-styled");
const useScopedHotkeysInstead = require("./rules/use-scopedhotkeys-instead");

module.exports = {
	rules: {
		"no-hardcoded-colors": noHardcodedColors,
		"sort-css-properties-alphabetically": cssAlphabetically,
		"styled-components-prefixed-with-styled":
			styledComponentsPrefixedWithStyled,
		"use-scopedhotkeys-instead": useScopedHotkeysInstead,
	},
};
