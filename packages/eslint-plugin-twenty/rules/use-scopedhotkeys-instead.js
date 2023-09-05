module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Enforce the use of useScopedHotkeys over useHotkeys",
		},
		messages: {
			useScopedHotkeysInstead:
				"Do not use raw useHotkeys. Please use useScopedHotkeys instead.",
		},
		recommended: true,
		fixable: "code",
		schema: [],
	},

	create: function (context) {
		return {
			CallExpression: function (node) {
				if (node.callee.name === "useHotkeys") {
					context.report({
						node: node,
						messageId: "useScopedHotkeysInstead",
					});
				}
			},
		};
	},
};
