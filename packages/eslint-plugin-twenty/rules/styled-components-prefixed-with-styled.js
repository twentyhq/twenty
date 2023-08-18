module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when StyledComponents are not prefixed with Styled',
      },
      recommended: true,
      fixable: 'code',
    schema: [],
  },
  create: function(context) {
    return {
      VariableDeclarator: node => {
        const templateExpr = node.init
        if (templateExpr?.type !== 'TaggedTemplateExpression') {
          return;
        }
        const tag = templateExpr.tag
        const tagged = tag.type === 'MemberExpression' ? tag.object 
                          : tag.type === 'CallExpression' ? tag.callee 
                          : null
        if (tagged?.name === 'styled') {
          const variable = node.id;
          if (variable?.name.startsWith('Styled')) {
            return;
          }
          context.report({ node, message: `'${variable.name}' is a StyledComponent and is not prefixed with Styled.` });
        }
      },
    }
  }
};
