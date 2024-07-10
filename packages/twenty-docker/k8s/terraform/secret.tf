resource "kubernetes_secret" "twentycrm_tokens" {
  metadata {
    name      = "tokens"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }

  data = {
    accessToken  = var.twentycrm_token_accessToken
    loginToken   = var.twentycrm_token_loginToken
    refreshToken = var.twentycrm_token_refreshToken
    fileToken    = var.twentycrm_token_fileToken
  }

  # type = "kubernetes.io/basic-auth"
}
