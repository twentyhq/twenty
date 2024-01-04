"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const sort_css_properties_alphabetically_1 = __importDefault(require("../rules/sort-css-properties-alphabetically"));
const ruleTester = new rule_tester_1.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
            jsx: true,
        },
    },
});
ruleTester.run("sort-css-properties-alphabetically", sort_css_properties_alphabetically_1.default, {
    valid: [
        {
            code: "const style = css`color: red;`;",
        },
        {
            code: "const style = css`background-color: $bgColor;color: red;`;",
        },
        {
            code: "const StyledComponent = styled.div`color: red;`;",
        },
        {
            code: "const StyledComponent = styled.div`background-color: $bgColor;color: red;`;",
        },
    ],
    invalid: [
        {
            code: "const style = css`color: #FF0000;background-color: $bgColor`;",
            output: "const style = css`background-color: $bgColorcolor: #FF0000;`;",
            errors: [
                {
                    messageId: "sortCssPropertiesAlphabetically",
                },
            ],
        },
        {
            code: "const StyledComponent = styled.div`color: #FF0000;background-color: $bgColor`;",
            output: "const StyledComponent = styled.div`background-color: $bgColorcolor: #FF0000;`;",
            errors: [
                {
                    messageId: "sortCssPropertiesAlphabetically",
                },
            ],
        },
    ],
});
