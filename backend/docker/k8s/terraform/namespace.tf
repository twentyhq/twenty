resource "kubernetes_namespace" "twentycrm" {
  metadata {
    annotations = {
      name = var.twentycrm_namespace
    }

    name = var.twentycrm_namespace
  }
}
